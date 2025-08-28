import { Sequelize } from "sequelize-typescript";
import { UserStatus } from "../define/enums";
import { generatePassword, genSalt } from "../utils/helper";
import { AdminUser } from "./models/AdminUser.model";

export const initAdminUser = async (sequelize: Sequelize) => {
  if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
    throw new Error(
      "ADMIN_USERNAME and/or ADMIN_PASSWORD not set in environment variables"
    );
  }
  const adminUser = await AdminUser.findOne({
    where: { username: process.env.ADMIN_USERNAME },
  });
  if (adminUser) {
    return;
  }
  const salt = genSalt();
  const cipherdPwd = generatePassword(process.env.ADMIN_PASSWORD, salt);
  const [, created ] = await AdminUser.findOrCreate({
    where: { username: process.env.ADMIN_USERNAME },
    defaults: {
      password: cipherdPwd,
      salt: salt,
      status: UserStatus.NORMAL,
    },
  });
  if (created) {
    console.log("Created admin user...");
  }
};
