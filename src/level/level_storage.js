const fs = require("fs");
const { fileURLToPath } = require("url");
const logger = require("../utils/logger");
const Level = require("./level");

const _LevelCacheStorageLogic = {

    levels: [],

    getCacheByName(name) {
        return _LevelCacheStorageLogic.levels[name] ?? null;
    },

    loadCache(name, create = false) {
        let cache = _LevelCacheStorageLogic.getCacheByName(name);

        if (cache) {
            return;
        }

        logger.info(`Loading cache '${name}' ...`);

        if (fs.existsSync(`./cache/${name}/${name}.json`)) {
            logger.info('Loaded cache from memory successfully');
            _LevelCacheStorageLogic.levels[name] = Level.fromJSON(fs.readFileSync(`./cache/${name}/${name}.json`));
        } else {
            if (create) {
                logger.info('New cache instance ' + name + ' was created');
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

        let folder = './cache/' + cache.name;
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder);
        }
        
        fs.writeFileSync(cache.path, cache.toJSON(), { encoding: 'utf8', flag: 'w' });
    },

    deleteCache(cache) {
        fs.unlink(cache.path, () => {
            logger.notice('Cache ' + cache.name + ' was deleted');
        });
    }

};

module.exports = _LevelCacheStorageLogic;