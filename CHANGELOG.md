# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
