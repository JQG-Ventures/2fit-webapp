const { i18n } = require('./next-i18next.config');

module.exports = {
	typescript: {
		ignoreBuildErrors: true,
	},
	i18n,
	images: {
		domains: ['2fitcontentstorage.blob.core.windows.net']
	}
};