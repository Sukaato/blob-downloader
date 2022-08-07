const { join } = require('path');

let extension = '';
if (process.platform === 'win32') {
  extension = '.exe';
}
console.log('extension:', extension);
console.log('----------------------------');

async function main() {
  const { execa } = await import('execa');
  const fs = await import('fs');
  const { exit } = await import('process');


  const rust = await execa('rustc', ['-vV']);
  console.log('rust:', rust);
  console.log('----------------------------');

  const infos = rust.stdout;
  console.log('infos:', infos);
  console.log('----------------------------');

  const [, targetTriple] = /host: (\S+)/g.exec(infos);
  console.log('targetTriple:', targetTriple);
  console.log('----------------------------');

  if (!targetTriple) {
    console.error('Failed to determine platform target triple')
  }

  fs.readdir('bin', (err, files) => {
    if (err) {
      console.log(err);
      exit(1);
    }

    fs.mkdirSync(join(process.cwd(), 'src-tauri', 'bin'), {
      recursive: true
    });

    for (const file of files) {
      fs.copyFileSync(
        join(process.cwd(), 'bin', file),
        join(process.cwd(), 'bin', `${file}-copy`)
      );
      fs.renameSync(
        join(process.cwd(), 'bin', `${file}-copy`),
        join(process.cwd(), 'src-tauri', 'bin', `${file.split('.')[0]}-${targetTriple}${extension}`)
      );
    }
  });
}

main().catch((e) => {
  console.log('dafuk');
  throw e
});