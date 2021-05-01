const fs = require("fs");
const logger = require("../utils/logger");
const Level = require("./level");

const _LevelCacheStorageLogic = {

    levels: [],

    getCacheByName(name) {
        return _LevelCacheStorageLogic.levels[name] ?? null;
    },

    loadCache(name, create = false) {
        let cache = _LevelCacheStorageLogic.getCacheByName(name);

        if(cache) {
            return;
        }

        logger.info(`Loading cache '${name}' ...`);

        if(fs.existsSync('cache/' + name + '.json')) {
            _LevelCacheStorageLogic.levels[name] = Level.fromFile(name, fs.readFileSync('cache' + name + '.json'));
        } else {
            if(create) {
                _LevelCacheStorageLogic.levels[name] = Level.create(name);
            }
        }
    },

    loadCaches(names, create = false) {
        names.forEach(name => {
            _LevelCacheStorageLogic.loadCache(name, create);
        });
    },

    saveCache(cache) {
        logger.info(`Saving cache for level '${cache.name}'`);
        fs.writeFile(cache.path, cache.toJSON(), () => {
            logger.info('Cache ' + cache.name + ' saved');
        });
    },

    deleteCache(cache) {
        fs.unlink(cache.path, () => {
            logger.notice('Cache ' + cache.name + ' was deleted');
        });
    }

};

module.exports = _LevelCacheStorageLogic;