import { ApiProperty } from "@midwayjs/swagger";
import { Rule, RuleType } from "@midwayjs/validate";
import { UPLOAD_TYPE } from "../utils/alicloud";

export class UploadDTO {
  @Rule(RuleType.string().max(10).min(1).required())
  @ApiProperty({ description: '文件名称', example: 'example.jpg' })
  filename: string;

  @Rule(
    RuleType.string()
      .equal(...Object.values(UPLOAD_TYPE))
      .default(UPLOAD_TYPE.pay)
  )
  @ApiProperty({
    description: '上传类型',
    example: UPLOAD_TYPE.pay,
    enum: UPLOAD_TYPE,
  })
  uploadType: UPLOAD_TYPE;
}