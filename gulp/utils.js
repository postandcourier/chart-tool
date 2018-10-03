const gulp = require('gulp');
const del = require('del');
const args = require('yargs').argv;
const jeditor = require('gulp-json-editor');
const shell = require('gulp-shell');
const replace = require('gulp-replace');
const gulpConfig = require('./gulp.config.js');
const size = require('gulp-size');

const p = require('../package.json');

gulp.task('set-dev-node-env', done => {
  process.env.NODE_ENV = 'development';
  done();
});

gulp.task('set-prod-node-env', done => {
  process.env.NODE_ENV = 'production';
  done();
});

gulp.task('size:build', () => {
  return gulp.src(`${gulpConfig.buildPath}/**/*`)
    .pipe(size({ title: 'Build', gzip: true, showFiles: true }));
});

gulp.task('clean-dist:dev', () => {
  return del([`${gulpConfig.buildPathDev}/**/*`]);
});

gulp.task('clean-dist:build', () => {
  return del([`${gulpConfig.buildPath}/**/*`]);
});

gulp.task('clean-meteor:build', () => {
  return del([`${gulpConfig.meteorBuildPath}/**/*`]);
});

gulp.task('clean-meteor-libs', () => {
  return del([
    `${gulpConfig.meteorBundle}/chart-tool.js`,
    `${gulpConfig.meteorBundle}/settings.js`,
    `${gulpConfig.meteorPath}/imports/ui/style/chart-tool.css`
  ]);
});

gulp.task('set-version', () => {
  return gulp.src('./README.md')
    .pipe(replace(/## Version\n\n([a-z0-9.]+)/, `## Version\n\n${p.version}`))
    .pipe(gulp.dest('./'));
});

gulp.task('buildver', () => {
  if (args.set) {
    const val = args.set;
    return gulp.src('./package.json')
      .pipe(jeditor(pkg => {
        pkg.buildVer = val.toString();
        return pkg;
      }))
      .pipe(gulp.dest('.'));
  } else {
    return gulp.src('./package.json')
      .pipe(shell([`echo ${p.buildVer}`]));
  }
});
