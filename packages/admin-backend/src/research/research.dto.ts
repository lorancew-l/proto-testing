import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsObject, IsString } from 'class-validator';
import { Research as ResearchData } from 'shared';

export class UpdateResearchDTO {
  @ApiProperty({ required: true, description: 'Research name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ required: true, description: 'Research structure' })
  @IsNotEmpty()
  @IsObject()
  data: ResearchData;
}
