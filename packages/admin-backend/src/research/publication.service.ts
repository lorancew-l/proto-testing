import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { isString } from 'lodash';

@Injectable()
export class PublicationService {
  private readonly baseUrl: string;
  private readonly bundleUrl: string;

  constructor(configService: ConfigService) {
    const baseUrl = configService.get<string | undefined>('RESPONDENT_SERVICE_URL');
    const bundleUrl = configService.get<string | undefined>('RESPONDENT_BUNDLE_CDN_URL');
    if (!baseUrl) throw new Error('Missing RESPONDENT_SERVICE_URL');
    if (!bundleUrl) throw new Error('Missing RESPONDENT_BUNDLE_CDN_URL');
    this.baseUrl = baseUrl;
    this.bundleUrl = bundleUrl;
  }

  async publishResearch({
    id,
    data,
    revision,
    pauseResearch,
  }: {
    id: string;
    data: object;
    revision: Number;
    pauseResearch?: boolean;
  }): Promise<{ url: string }> {
    const response = await fetch(new URL(`/api/publication/${id}`, this.baseUrl), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: { ...data, revision }, cdnUrl: this.bundleUrl, paused: pauseResearch }),
    });

    if (!response.ok) {
      throw new PublicationError();
    }

    try {
      const result = await response.json();
      if ('url' in result && isString(result.url)) {
        return { url: result.url };
      } else {
        throw new PublicationError();
      }
    } catch (err) {
      throw new PublicationError();
    }
  }
}

export class PublicationError extends Error {
  constructor() {
    super('Failed to publish research!');
  }
}
