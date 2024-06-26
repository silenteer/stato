# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.5.0](https://github.com/silenteer/use-stager/compare/stato1.4.6...stato1.5.0) (2024-06-26)


### Features

* added start/stop api and corresponding react hooks ([b1518ef](https://github.com/silenteer/use-stager/commit/b1518efd8b2c3259b897d1f1c9f6584f133b2392))

### [1.4.6](https://github.com/silenteer/use-stager/compare/stato1.4.5...stato1.4.6) (2024-06-25)


### Features

* added type variations to selectors ([f8d4582](https://github.com/silenteer/use-stager/commit/f8d458288cf62aa57f34bb7169fe9dc15e0484f2))

### [1.4.5](https://github.com/silenteer/use-stager/compare/stato1.4.4...stato1.4.5) (2024-06-25)


### Bug Fixes

* reverted to useMemo ([0feb1f1](https://github.com/silenteer/use-stager/commit/0feb1f167e1652b2a6fddf54917788aad6896267))

### [1.4.4](https://github.com/silenteer/use-stager/compare/stato1.4.3...stato1.4.4) (2024-06-25)


### Bug Fixes

* useCallback instead of useMemo ([66c07d5](https://github.com/silenteer/use-stager/commit/66c07d50d8124e2c47be02a136487c9302f4f437))

### [1.4.3](https://github.com/silenteer/use-stager/compare/stato1.4.2...stato1.4.3) (2024-06-25)


### Features

* added transition and state selector ([5662d6a](https://github.com/silenteer/use-stager/commit/5662d6a35403feb27af5715f3a4eee95918bf4a9))

### [1.4.2](https://github.com/silenteer/use-stager/compare/stato1.4.1...stato1.4.2) (2024-06-25)


### Bug Fixes

* state change triggers when context changes ([0d733df](https://github.com/silenteer/use-stager/commit/0d733df36312f2be494ab3f57aed013e011781ad))

### [1.4.1](https://github.com/silenteer/use-stager/compare/stato1.4.1-rc.0...stato1.4.1) (2024-06-25)


### Bug Fixes

* corrected transition status ([c5399a7](https://github.com/silenteer/use-stager/commit/c5399a737d9424f3646e55625426839de719e310))

### [1.4.1-rc.0](https://github.com/silenteer/use-stager/compare/stato1.4.0...stato1.4.1-rc.0) (2024-06-25)

## [1.4.0](https://github.com/silenteer/use-stager/compare/stato1.3.1...stato1.4.0) (2024-06-25)


### Features

* added react-reset (removed state reset) ([00582f0](https://github.com/silenteer/use-stager/commit/00582f0631bee519115350db33a173d70f74b67f))


### Bug Fixes

* remove reset, not a good idea ([8005116](https://github.com/silenteer/use-stager/commit/8005116d90377d5a90d4b5f636f26076adf7ceec))

### [1.3.1](https://github.com/silenteer/use-stager/compare/stato1.3.0...stato1.3.1) (2024-06-25)


### Features

* added reset api, machine will be back to the initialState ([20d778a](https://github.com/silenteer/use-stager/commit/20d778ab6abeb483105f00f47d44f2e1578bf4d4))

## [1.3.0](https://github.com/silenteer/use-stager/compare/stato1.2.2...stato1.3.0) (2024-06-24)


### Features

* added refs api to expose internal control ([5972dcf](https://github.com/silenteer/use-stager/commit/5972dcf20b6d5766de9d150c45ca19796ed84184))

### [1.2.2](https://github.com/silenteer/use-stager/compare/stato1.2.1...stato1.2.2) (2024-06-20)


### Bug Fixes

* fixed issue with params are not injected to listener callback ([ea31250](https://github.com/silenteer/use-stager/commit/ea312506ff91736c489d1312819d2fdaa6b289e9))

### [1.2.1](https://github.com/silenteer/use-stager/compare/stato1.2.0...stato1.2.1) (2024-06-20)


### Bug Fixes

* Remove * operations, seems to be buggy ([06e8b9c](https://github.com/silenteer/use-stager/commit/06e8b9ca788efe0a6185a178b30851516f930ba4))

## [1.2.0](https://github.com/silenteer/use-stager/compare/stato1.1.0...stato1.2.0) (2024-06-20)


### Features

* added typescript as peer dependencies and added few tweaks ([fce5e37](https://github.com/silenteer/use-stager/commit/fce5e377c6eadc445a7b2381d3ac2695d3db60d3))

## [1.1.0](https://github.com/silenteer/use-stager/compare/stato1.0.2...stato1.1.0) (2024-06-20)


### Features

* can listen to any names on builder ([7ac41cc](https://github.com/silenteer/use-stager/commit/7ac41cc797137026f95916fecc97b8d16fb06f8e))

### [1.0.2](https://github.com/silenteer/use-stager/compare/stato1.0.1...stato1.0.2) (2024-06-20)


### Bug Fixes

* added missing getServerSnapshot ([a6b49c5](https://github.com/silenteer/use-stager/commit/a6b49c518109816e15f30147e5d1011bd59e5e33))

### [1.0.1](https://github.com/silenteer/use-stager/compare/stato1.0.0...stato1.0.1) (2024-06-20)

## 1.0.0 (2024-06-19)


### Features

* added more react specific options, added withStager to manage lifecycle ([e594019](https://github.com/silenteer/use-stager/commit/e5940195205823e9810555ef2e1395821a3b3719))
* added small tests ([bd1912f](https://github.com/silenteer/use-stager/commit/bd1912f3a2cc7d185339e787847996bbb3591176))
* added start/stop API ([9005396](https://github.com/silenteer/use-stager/commit/9005396da35c3bc78625f1660e939bd95692874c))
* added tests to final the API ([349ec36](https://github.com/silenteer/use-stager/commit/349ec36fb1a304d13288de1231469c1c4b0f8a4f))
* added transition tracking ([04ee2b5](https://github.com/silenteer/use-stager/commit/04ee2b54ec4ee591196bc0e19e2e56cb04aa3b3e))
* added transitioning status ([04d4b3d](https://github.com/silenteer/use-stager/commit/04d4b3d61f15754bd7604092d2e502fdbe9279dc))
* added useListen for react, added unregister to clean up listening ([9de6b6f](https://github.com/silenteer/use-stager/commit/9de6b6f63cab5e18a6225b7ce586910f86ea7bae))
* added valtio, transitioning APIs ([3da3111](https://github.com/silenteer/use-stager/commit/3da311175bbc5007a9a4f2c8a7437d5796838a1d))
* expose react-related stuff ([582fe5c](https://github.com/silenteer/use-stager/commit/582fe5c0c5d0e0545ad5e617963ea0e4c7cb6a3e))
* moved to a simpler state to reduce ts computation ([d4be407](https://github.com/silenteer/use-stager/commit/d4be407a070d3ecd2b6b6e09b473135535e06ce3))
* now a rewrite ([10812e9](https://github.com/silenteer/use-stager/commit/10812e9e37cc5158dc6c6021c727cafeca70502b))
* redefine API surface, finalizing type def ([70c4cdd](https://github.com/silenteer/use-stager/commit/70c4cdd74119864f59a68993cc35612752088a53))
* restructured to separate machine from react ([9d62204](https://github.com/silenteer/use-stager/commit/9d622045baeda416c0d4275d31e4b3b873da854a))
* trial Stage element ([299d135](https://github.com/silenteer/use-stager/commit/299d135e86e5344390d8ccbcc1acbc39eb893a44))
* use lodash.cloneDeep to implement reset, added lifecycle function ([62cfead](https://github.com/silenteer/use-stager/commit/62cfead70bede196d8d99f0314061378feca7d7e))
* use radix to build router ([34f838a](https://github.com/silenteer/use-stager/commit/34f838aa29ec52e33d7aa076cd9eb278905906c7))


### Bug Fixes

* added dispatch to Stage and Stager ([6b89ab3](https://github.com/silenteer/use-stager/commit/6b89ab38a4905dd81609e554364b76067470c461))
* added react to resolve jsx, changed initialContext to initialStage ([e0da2a5](https://github.com/silenteer/use-stager/commit/e0da2a5b540093ddcb4873a31a1516af7971f588))
* corrected calling useEffect position ([2b8d7f4](https://github.com/silenteer/use-stager/commit/2b8d7f4a2098c12255dfe5d2772c357f85886d68))
* corrected way to express a stage ([9f7ec1e](https://github.com/silenteer/use-stager/commit/9f7ec1e507b2d22b223896cdf17177aa3c13aa67))
* fix various bugs, added react-testing library ([5b62d6f](https://github.com/silenteer/use-stager/commit/5b62d6f164de8a568b5b3627cdaca12fdefc1280))
* fix weird react type ([c4cb906](https://github.com/silenteer/use-stager/commit/c4cb9061c64975419924b668748a796d3b6b9047))
* forgot useSnapshot ([b25a804](https://github.com/silenteer/use-stager/commit/b25a8040ec3aa99fbbdfca91f104f8fa7b102c1a))
* unnecessary undefined ([4fe8504](https://github.com/silenteer/use-stager/commit/4fe85045c232e3eb24b7eb620ab508b2592e19cd))
* wrong config ([08b4842](https://github.com/silenteer/use-stager/commit/08b4842556ee9a4d3d7ac001f064093003675796))

## 1.0.0 (2024-06-19)


### Features

* added more react specific options, added withStager to manage lifecycle ([e594019](https://github.com/silenteer/use-stager/commit/e5940195205823e9810555ef2e1395821a3b3719))
* added small tests ([bd1912f](https://github.com/silenteer/use-stager/commit/bd1912f3a2cc7d185339e787847996bbb3591176))
* added start/stop API ([9005396](https://github.com/silenteer/use-stager/commit/9005396da35c3bc78625f1660e939bd95692874c))
* added tests to final the API ([349ec36](https://github.com/silenteer/use-stager/commit/349ec36fb1a304d13288de1231469c1c4b0f8a4f))
* added transition tracking ([04ee2b5](https://github.com/silenteer/use-stager/commit/04ee2b54ec4ee591196bc0e19e2e56cb04aa3b3e))
* added transitioning status ([04d4b3d](https://github.com/silenteer/use-stager/commit/04d4b3d61f15754bd7604092d2e502fdbe9279dc))
* added useListen for react, added unregister to clean up listening ([9de6b6f](https://github.com/silenteer/use-stager/commit/9de6b6f63cab5e18a6225b7ce586910f86ea7bae))
* added valtio, transitioning APIs ([3da3111](https://github.com/silenteer/use-stager/commit/3da311175bbc5007a9a4f2c8a7437d5796838a1d))
* expose react-related stuff ([582fe5c](https://github.com/silenteer/use-stager/commit/582fe5c0c5d0e0545ad5e617963ea0e4c7cb6a3e))
* moved to a simpler state to reduce ts computation ([d4be407](https://github.com/silenteer/use-stager/commit/d4be407a070d3ecd2b6b6e09b473135535e06ce3))
* now a rewrite ([10812e9](https://github.com/silenteer/use-stager/commit/10812e9e37cc5158dc6c6021c727cafeca70502b))
* redefine API surface, finalizing type def ([70c4cdd](https://github.com/silenteer/use-stager/commit/70c4cdd74119864f59a68993cc35612752088a53))
* restructured to separate machine from react ([9d62204](https://github.com/silenteer/use-stager/commit/9d622045baeda416c0d4275d31e4b3b873da854a))
* trial Stage element ([299d135](https://github.com/silenteer/use-stager/commit/299d135e86e5344390d8ccbcc1acbc39eb893a44))
* use lodash.cloneDeep to implement reset, added lifecycle function ([62cfead](https://github.com/silenteer/use-stager/commit/62cfead70bede196d8d99f0314061378feca7d7e))
* use radix to build router ([34f838a](https://github.com/silenteer/use-stager/commit/34f838aa29ec52e33d7aa076cd9eb278905906c7))


### Bug Fixes

* added dispatch to Stage and Stager ([6b89ab3](https://github.com/silenteer/use-stager/commit/6b89ab38a4905dd81609e554364b76067470c461))
* added react to resolve jsx, changed initialContext to initialStage ([e0da2a5](https://github.com/silenteer/use-stager/commit/e0da2a5b540093ddcb4873a31a1516af7971f588))
* corrected calling useEffect position ([2b8d7f4](https://github.com/silenteer/use-stager/commit/2b8d7f4a2098c12255dfe5d2772c357f85886d68))
* corrected way to express a stage ([9f7ec1e](https://github.com/silenteer/use-stager/commit/9f7ec1e507b2d22b223896cdf17177aa3c13aa67))
* fix various bugs, added react-testing library ([5b62d6f](https://github.com/silenteer/use-stager/commit/5b62d6f164de8a568b5b3627cdaca12fdefc1280))
* fix weird react type ([c4cb906](https://github.com/silenteer/use-stager/commit/c4cb9061c64975419924b668748a796d3b6b9047))
* forgot useSnapshot ([b25a804](https://github.com/silenteer/use-stager/commit/b25a8040ec3aa99fbbdfca91f104f8fa7b102c1a))
* unnecessary undefined ([4fe8504](https://github.com/silenteer/use-stager/commit/4fe85045c232e3eb24b7eb620ab508b2592e19cd))
* wrong config ([08b4842](https://github.com/silenteer/use-stager/commit/08b4842556ee9a4d3d7ac001f064093003675796))

# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.
