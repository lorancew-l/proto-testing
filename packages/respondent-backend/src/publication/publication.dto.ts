import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsObject, IsString } from 'class-validator';

export class PublishResearchDTO {
  @ApiProperty({ required: true, description: 'Research data' })
  @IsNotEmpty()
  @IsObject()
  data: object;

  @ApiProperty({ required: true, description: 'Research cdn url' })
  @IsNotEmpty()
  @IsString()
  cdnUrl: string;
}
