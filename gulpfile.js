const gulp        = require('gulp');
const browserSync = require('browser-sync').create();
const sass        = require('gulp-sass')(require('sass'));
const cleanCSS    = require('gulp-clean-css');
const autoprefixer = require('gulp-autoprefixer');
const rename      = require("gulp-rename");
const del         = require('del');
const imagemin = require('gulp-imagemin');

// Пути
const paths = {
  src: {
    html: "src/*.html",
    scss: "src/sass/**/*.+(scss|sass)",
    img:  "src/img/**/*.{jpg,jpeg,png,svg,gif}"
  },
  dist: {
    base: "dist",
    css:  "dist/css",
    img:  "dist/img"
  }
};

// === ЗАДАЧИ ===

// Компилируем SCSS -> CSS для разработки (src)
gulp.task('styles-dev', function() {
  return gulp.src(paths.src.scss)
    .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
    .pipe(rename({ suffix: '.min' }))
    .pipe(autoprefixer())
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(gulp.dest("src/css"))
    .pipe(browserSync.stream());
});

// Компилируем SCSS -> CSS для production (dist)
gulp.task('styles-build', function() {
  return gulp.src(paths.src.scss)
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(rename({ suffix: '.min' }))
    .pipe(autoprefixer())
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(gulp.dest(paths.dist.css));
});

// Очистка папки dist
gulp.task('clean', function () {
  return del([paths.dist.base]);
});

// Копируем HTML и CSS в dist
gulp.task('copy-html', function () {
  return gulp.src(paths.src.html)
    .pipe(gulp.dest(paths.dist.base));
});

// Сервер и перезагрузка
gulp.task('server', function() {
  browserSync.init({
    server: {
      baseDir: "src"
    }
  });

  gulp.watch(paths.src.html).on('change', browserSync.reload);
});

// Слежение за изменениями
gulp.task('watch', function() {
  gulp.watch("src/sass/**/*.+(scss|sass)", gulp.parallel('styles-dev'));
});


// Оптимизация изображений
gulp.task('images', function () {
  return gulp.src(paths.src.img)
    .pipe(imagemin([
      imagemin.gifsicle({ interlaced: true }),
      imagemin.mozjpeg({ quality: 75, progressive: true }),
      imagemin.optipng({ optimizationLevel: 5 }),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest(paths.dist.img));
});

gulp.task('build', gulp.series(
  'clean',
  gulp.parallel('styles-build', 'copy-html', 'images')
));

// Дефолтная задача — разработка
gulp.task('default', gulp.parallel('styles-dev', 'server', 'watch'));