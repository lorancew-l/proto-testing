import { Injectable } from '@nestjs/common';

import { Request } from 'express';
import { UAParser } from 'ua-parser-js';

@Injectable()
export class EnrichmentService {
  getDeviceDetails(req: Request) {
    const ua = req.headers['user-agent'] || '';
    const result = UAParser(ua);

    const os = result.os.name?.toLowerCase() || 'unknown';
    const browser = result.browser.name || 'unknown';
    const deviceType = result.device.type || 'desktop';

    return {
      os,
      browser,
      deviceType,
    };
  }
}
