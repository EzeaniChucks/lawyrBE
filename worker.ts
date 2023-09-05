import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';

export function useMapInWorkerThread(data: any[], mapper: () => any) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(__filename, { workerData: { data, mapper } });
    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
}

if (!isMainThread) {
  const { data, mapper } = workerData;
  const mappedData = data.map(mapper);
  parentPort.postMessage(mappedData);
}
