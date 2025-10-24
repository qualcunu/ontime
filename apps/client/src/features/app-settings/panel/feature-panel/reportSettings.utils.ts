import { EntryId, isOntimeEvent, MaybeNumber, OntimeReport, RundownEntries } from 'ontime-types';

import { makeCSVFromArrayOfArrays } from '../../../../common/utils/csv';
import { formatTime } from '../../../../common/utils/time';

entrycount = 0;

export type CombinedReport = {
  id: EntryId;
  index: number;
  title: string;
  cue: string;
  scheduledStart: number;
  actualStart: MaybeNumber;
  scheduledEnd: number;
  actualEnd: MaybeNumber;
  note: string;
  entrycount: number;
};


/**
 * Creates a combined report with the rundown data
 */
export function getCombinedReport(
  report: OntimeReport,
  rundown: RundownEntries,
  flatOrder: EntryId[],
): CombinedReport[] {
  if (Object.keys(report).length === 0) return [];
  if (flatOrder.length === 0) return [];

  const combinedReport: CombinedReport[] = [];

  let index = 1;
  for (let i = 0; i < flatOrder.length; i++) {
    const id = flatOrder[i];
    const entry = rundown[id];
    if (!entry || !isOntimeEvent(entry)) continue;

    if (!(id in report)) {
      // combinedReport.push({
      //   id: id,
      //   index: index,
      //   title: entry.title,
      //   cue: entry.cue,
      //   scheduledStart: entry.timeStart,
      //   actualEnd: null,
      //   scheduledEnd: entry.timeEnd,
      //   actualStart: null,
      //   note: entry.note,
      //   entrycount: entrycount,
      // });
    }

    if (id in report) {
      entrycount = entrycount+1;
      combinedReport.push({
        id: id,
        index: index,
        title: entry.title,
        cue: entry.cue,
        scheduledStart: entry.timeStart,
        actualEnd: report[id].endedAt,
        scheduledEnd: entry.timeEnd,
        actualStart: report[id].startedAt,
        note: entry.note,
        entrycount: entrycount,
      });
    }
    index++;
  }

  return combinedReport;
}

const csvHeader = ['Index', 'Title', 'Cue', 'Scheduled Start', 'Actual Start', 'Scheduled End', 'Actual End', 'Note', 'entrycount'];

/**
 * Transforms a CombinedReport into a CSV string
 */
export function makeReportCSV(combinedReport: CombinedReport[]) {
  const csv: string[][] = [];
  csv.push(csvHeader);

  for (const entry of combinedReport) {
    csv.push([
      String(entry.index),
      entry.title,
      entry.cue,
      formatTime(entry.scheduledStart),
      formatTime(entry.actualStart),
      formatTime(entry.scheduledEnd),
      formatTime(entry.actualEnd),
      entry.note,
      entry.entrycount,
    ]);
  }

  return makeCSVFromArrayOfArrays(csv);
}
