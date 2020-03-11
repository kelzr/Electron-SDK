#!/usr/bin/env node

const decomment = require('decomment');
const fs = require('fs-extra');
const fsnative = require('fs');
const path = require('path');

function fileDisplay(filePath, arr, cb){
    //根据文件路径读取文件，返回文件列表
    fsnative.readdir(filePath,function(err,files){
        if(err){
            console.warn(err)
        }else{
            //遍历读取到的文件列表
            files.forEach(function(filename){
                //获取当前文件的绝对路径
                var filedir = path.join(filePath,filename);
                //根据文件路径获取文件信息，返回一个fs.Stats对象
                fsnative.stat(filedir,function(eror,stats){
                    if(eror){
                        console.warn('获取文件stats失败');
                    }else{
                        var isFile = stats.isFile();//是文件
                        var isDir = stats.isDirectory();//是文件夹
                        if(isFile){
                            console.log(filedir);
                            arr.push(filedir)
                            cb()
                            return
                        }
                        if(isDir){
                            fileDisplay(filedir, arr, cb);//递归，如果是文件夹，就继续遍历该文件夹下面的文件
                        }
                    }
                })
            });
        }
    });
}

function travel (dir) {
  const arr = []
  fileDisplay(dir, arr, function(){
    console.log(arr)
    for (const item of arr) {
      translate(item)
    }
  })
}

travel('ts/Api')

function translate(file) {
  const source = fs
    .readFileSync(file)
    .toString();
  let cnOnly = decomment.text(source, {
    ignore: /\/\*\*\s*(@zh-cn)([^*]|(\*(?!\/)))*\*\//g,
  });
  const enOnly = decomment.text(source, {
    ignore: /\/\*\*(?!\s*@zh-cn)([^*]|(\*(?!\/)))*\*\//g,
  });


  cnOnly = cnOnly.replace(/\@zh\-cn/g, '')

  const docDir = path.join(__dirname, 'ts/output');

  fs.ensureDirSync(docDir);

  let count = 0;

  function ret() {
    console.log('xxx')
    return
  }
  fs.writeFile(
    path.join(docDir, file.substr(6)),
    cnOnly,
    {
      encoding: 'utf-8',
    },
    ret
  );

  // fs.writeFile(
  //   path.join(docDir, 'en.java'),
  //   enOnly,
  //   {
  //     encoding: 'utf-8',
  //   },
  //   ret
  // );

}

// const source = fs
//   .readFileSync(path.join(__dirname, './source/ErrorInfo.java'))
//   .toString();
// const cnOnly = decomment.text(source, {
//   ignore: /\/\*\*\s*(@zh-cn)([^*]|(\*(?!\/)))*\*\//g,
// });
// const enOnly = decomment.text(source, {
//   ignore: /\/\*\*(?!\s*@zh-cn)([^*]|(\*(?!\/)))*\*\//g,
// });
//
// const docDir = path.join(__dirname, './output');
//
// fs.ensureDirSync(docDir);
//
// let count = 0;
//
// function ret() {
//   count += 1;
//   if (count === 2) {
//     console.log('files generated');
//     // eslint-disable-next-line unicorn/no-process-exit
//     process.exit();
//   }
// }
//
// fs.writeFile(
//   path.join(docDir, 'zh-CN.java'),
//   cnOnly,
//   {
//     encoding: 'utf-8',
//   },
//   ret
// );
//
// fs.writeFile(
//   path.join(docDir, 'en.java'),
//   enOnly,
//   {
//     encoding: 'utf-8',
//   },
//   ret
// );
