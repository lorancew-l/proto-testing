import { ApiProperty } from '@nestjs/swagger';

import { IsBoolean, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class PublishResearchDTO {
  @ApiProperty({ required: true, description: 'Research data' })
  @IsNotEmpty()
  @IsObject()
  data: object;

  @ApiProperty({ required: true, description: 'Research cdn url' })
  @IsNotEmpty()
  @IsString()
  cdnUrl: string;

  @ApiProperty({ required: true, description: 'Pause research' })
  @IsOptional()
  @IsBoolean()
  paused?: boolean;
}
