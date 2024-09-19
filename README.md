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
CREATE DATABASE hipo_pay;
/** 用于单测 */
CREATE DATABASE hipo_pay_test;
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

- Use `npm run lint` to check code style.
- Use `npm test` to run unit test.


[midway]: https://midwayjs.org
