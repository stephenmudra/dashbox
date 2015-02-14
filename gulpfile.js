var gulp = require("gulp");
var gutil = require("gulp-util");
var sass = require('gulp-sass');
var path = require('path');
var webpack = require("webpack");
var changed = require('gulp-changed');
var browserSync = require('browser-sync');
var nodemon = require('gulp-nodemon');
var _  = require('lodash');

var webpackConfig = {
    entry: "./app/client",

    output: {
        filename: '[name].js',
        chunkFilename: '[id].chunk.js',
        path: path.join('public', 'app'),
        publicPath: '/app/'
    },

    module: {
        loaders: [
            { test: /\.js$/, loader: 'jsx-loader?harmony&insertPragma=React.DOM' },
            { test: /\.jsx$/, loader: 'jsx-loader?harmony&insertPragma=React.DOM' },
            { test: require.resolve('react'), loader: 'expose?React' }
        ]
    },

    resolve: {
        root: path.join(__dirname, "app")
    },

    plugins: []
};

gulp.task("webpack:build", function(callback) {
    // run webpack
    webpack(_.assign(webpackConfig, {
        plugins: webpackConfig.plugins.concat(
            new webpack.DefinePlugin({
                "process.env": {
                    "NODE_ENV": JSON.stringify("production")
                }
            }),
            new webpack.optimize.DedupePlugin(),
            new webpack.optimize.UglifyJsPlugin()
        )
    }), function(err, stats) {
        if(err) throw new gutil.PluginError("webpack:build", err);
        gutil.log("[webpack:build]", stats.toString({
            colors: true
        }));
        callback();
    });
});

// create a single instance of the compiler to allow caching
var devCompiler = webpack(_.assign(webpackConfig, {
    devtool: "sourcemap",
    debug: true
}));

gulp.task("webpack:build-dev", function(callback) {
    // run webpack
    devCompiler.run(function(err, stats) {
        if(err) throw new gutil.PluginError("webpack:build-dev", err);
        gutil.log("[webpack:build-dev]", stats.toString({
            colors: true
        }));
        callback();
    });
});

gulp.task('sass:build', function () {
    gulp.src('app/assets/scss/**/*.scss')
        .pipe(sass({
            outputStyle: 'compressed'
        }))
        .pipe(gulp.dest('public/assets/css'));
});

gulp.task('sass:build-dev', function () {
    gulp.src('app/assets/scss/**/*.scss')
        .pipe(sass({
            outputStyle: 'nested'
        }))
        .pipe(gulp.dest('public/assets/css'));
});

gulp.task('images', function () {
    gulp.src('app/assets/images/**')
        .pipe(changed('public/assets/images'))
        .pipe(gulp.dest('public/assets/images'));
});

gulp.task('fonts', function() {
    gulp.src('app/assets/fonts/**')
        .pipe(changed('public/assets/fonts'))
        .pipe(gulp.dest('public/assets/fonts'));
});


// we'd need a slight delay to reload browsers
// connected to browser-sync after restarting nodemon
var BROWSER_SYNC_RELOAD_DELAY = 1000;

gulp.task('nodemon', function (cb) {
    var called = false;
    return nodemon({
        script: 'app.js',

        watch: ['app.js', 'app/server.js']
    })
        .on('start', function onStart() {
            // ensure start only got called once
            if (!called) { cb(); }
            called = true;
        })
        .on('restart', function onRestart() {
            // reload connected browsers after a slight delay
            setTimeout(function reload() {
                browserSync.reload({
                    stream: false   //
                });
            }, BROWSER_SYNC_RELOAD_DELAY);
        });
});

gulp.task('browser-sync', ['nodemon'], function () {
    browserSync.init({
        files: ['public/**/*.*'],
        proxy: 'http://localhost:3000',
        port: 4000
    });
});



// The development server (the recommended option for development)
gulp.task("default", ['watch', 'browser-sync']);

gulp.task("watch", ["webpack:build-dev", "sass:build-dev", "images", "fonts"], function() {
    gulp.watch(["app/**/*.js", "app/**/*.jsx"], ["webpack:build-dev"]);
    gulp.watch(["app/assets/scss/**/*.scss"], ["sass:build-dev"]);
    gulp.watch(['app/assets/images/**'], ["images"]);
    gulp.watch(['app/assets/fonts/**'], ["fonts"]);
});

// Production build
gulp.task("build", ["webpack:build", "sass:build", "images", "fonts"]);

