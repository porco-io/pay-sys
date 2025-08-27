# my_midway_project

## QuickStart

<!-- add docs here for user -->

see [midway docs][midway] for more detail.

### Development

```bash
$ npm i
$ npm run dev
$ open http://localhost:7001/
```

### Deploy

```bash
$ npm start
```

### npm scriptsa

## QuickStart

<!-- add docs here for user -->

see [midway docs][midway] for more detail.

### Development

```bash
$ npm i
$ npm run dev
$ open http://localhost:7001/
```

### Deploy

```bash
$ npm start
```


### 项目介绍
Hipo Pay服务



### 环境搭建
使用podman迅速创建本地数据库

```bash
podman run --name postgres -e POSTGRES_PASSWORD=Abba1234! -tid -p 5432:5432 postgres
```
创建数据库
```sql
CREATE DATABASE pay;
/** 用于单测 */
CREATE DATABASE pay_test;
```

创建redis缓存(使用keydb平替redis)
```bash
podman run -tid -p 6379:6379 --name keydb eqalpha/keydb
```

启动rabbitmq: 
```bash
podman run -d \
  --name rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  -e RABBITMQ_DEFAULT_USER=hipo-server \
  -e RABBITMQ_DEFAULT_PASS=123456z! \
  docker.io/rabbitmq:3-management
```
启动后登录后台管理添加一个vHost，名称是: "/pay"

- Use `npm run lint` to check code style.
- Use `npm test` to run unit test.


[midway]: https://midwayjs.org


### LUID nanoid uuid

- LUID: 本地唯一标识符，由服务端生成，保证唯一性，长度为23位, 支持单机顺序但不保证并发顺序。
- UUID: 通用唯一标识符，由算法生成，保证唯一性，长度为36位。
- nanoid: 一个小型的 JavaScript 库，用于生成基于随机字符串的唯一 ID。 它可以生成短、唯一的 ID，适用于各种场景。