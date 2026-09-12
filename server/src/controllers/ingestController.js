import { ErrorGroup } from '../models/ErrorGroup.js';
import { ErrorOccurrence } from '../models/ErrorOccurrence.js';
import { generateFingerprint } from '../services/errorFingerprint/generateFingerprint.js';
import { parseStackTrace } from '../services/stackTrace/index.js';
import { bumpProjectCacheVersion } from '../services/cacheService.js';
import { aggregationQueue } from '../config/queue.js';
import { emitNewOrUpdatedError } from '../sockets/emitters.js';
import { catchAsync } from '../utils/catchAsync.js';
import { success } from '../utils/apiResponse.js';

export const ingestError = catchAsync(async (req, res) => {
  const { message, stackTrace, severity, environment, service, timestamp, metadata } = req.body;
  const project = req.project;

  const { fingerprint, errorType } = generateFingerprint({ message, stackTrace, service });
  const { frames } = parseStackTrace(stackTrace);

  let errorGroup = await ErrorGroup.findOne({ project: project._id, fingerprint });

  if (errorGroup) {
    errorGroup.lastSeen = timestamp;
    errorGroup.occurrenceCount += 1;
    if (errorGroup.status !== 'open') {
      errorGroup.status = 'open';
    }
    await errorGroup.save();
  } else {
    errorGroup = await ErrorGroup.create({
      project: project._id,
      fingerprint,
      title: message.slice(0, 200),
      errorType,
      service,
      environment,
      severity,
      status: 'open',
      firstSeen: timestamp,
      lastSeen: timestamp,
      occurrenceCount: 1,
      sampleStackTrace: stackTrace,
    });
  }

  const occurrence = await ErrorOccurrence.create({
    errorGroup: errorGroup._id,
    project: project._id,
    message,
    stackTrace,
    severity,
    environment,
    service,
    metadata,
    parsedFrames: frames,
    timestamp,
  });

  await bumpProjectCacheVersion(project._id);
  await aggregationQueue.add(
    'recurring-check',
    { errorGroupId: errorGroup._id.toString(), projectId: project._id.toString() },
    { jobId: `recurring-check:${errorGroup._id}:${Date.now()}` }
  );

  // Live-update anyone viewing this project's dashboard right now.
  emitNewOrUpdatedError(project._id.toString(), errorGroup.toSafeObject());

  return success(res, {
    statusCode: 202,
    message: 'Error ingested',
    data: { errorGroupId: errorGroup._id, occurrenceId: occurrence._id },
  });
});
