module.exports = {
    lintOnSave: false,
    chainWebpack: config => {
        config.module
            .rule('md')
            .test(/\.md$/)
            .use('raw-loader')
            .loader('raw-loader');
        config.module
            .rule('txt')
            .test(/\.txt$/)
            .use('raw-loader')
            .loader('raw-loader');
        config.module
            .rule('webimg')
            .test(/\.webimg$/)
            .use('webimg-loader')
            .loader(require.resolve("./loader/webimg-loader"));
    }
}