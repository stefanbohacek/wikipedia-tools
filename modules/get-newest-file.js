import fs from 'fs';
import { glob } from 'glob'

const getNewestFile = async (dir) => {
  const newestFile = glob.sync(`${dir}/*`)
  .map(name => ({name, ctime: fs.statSync(name).ctime}))
  .sort((a, b) => b.ctime - a.ctime)[0].name;
  return newestFile;
}

export default getNewestFile;
