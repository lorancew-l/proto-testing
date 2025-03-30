import { Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth } from '@nestjs/swagger';

import { AccessGuard } from '../auth/guards';

import { FileUploadService } from './file-upload.service';

@Controller('upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('single')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth('Authorization')
  @UseGuards(AccessGuard)
  uploadSingle(@UploadedFile() file: Express.Multer.File) {
    return this.fileUploadService.uploadFile(file);
  }
}
