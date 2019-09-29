import gulp from 'gulp';
import responsive from 'gulp-responsive';
import del from 'del';
import runSequence from 'run-sequence';

// Create responsive images for jpg files (leaving other file extensions alone)
gulp.task('jpg-images', function() {
  return gulp.src('images/**/*.jpg')
    .pipe(responsive({
      // Resize all jpg images to three different sizes
      '**/*.jpg': [{
        width: 800,
        quality: 70,
        rename: { suffix: '-large'}
      }, {
        width: 600,
        quality: 50,
        rename: { suffix: '-medium'}
      }, {
        width: 300,
        quality: 40,
        rename: { suffix: '-small'}
      }]
    },))
    .pipe(gulp.dest('img/'));
});

// Grab any other images and add them to the img folder
gulp.task('other-images', function() {
  return gulp.src(['!images/**/*.jpg', 'images/**/*.*'])
    .pipe(gulp.dest('img/'));
});

// clean up the img folder
gulp.task('clean', function(done) {
  return del(['img/'], done);
});

// Run 'gulp images' to execute this task
gulp.task("images", function(done) {
  runSequence(
    'clean',
    ['jpg-images','other-images'],
    done
  );
});