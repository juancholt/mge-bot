import axios from 'axios';

export async function downloadAndSplitInRows(url: string) {
  const { data } = await axios.get<string>(url, {
    responseType: 'blob',
  });
  const [, ...governorDataList] = data.split('\n');
  return governorDataList;
}
