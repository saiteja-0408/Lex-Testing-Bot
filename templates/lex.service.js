/**
 * Lex Service
 * ============================================================================
 * Service for interacting with AWS Lex V2 Runtime
 * 
 * Purpose:
 * - Abstracts AWS Lex SDK interactions
 * - Handles request/response formatting
 * - Manages session attributes
 * - Provides error handling
 * 
 * Usage:
 * ```javascript
 * import { lexService } from './lex.service.js';
 * const response = await lexService.recognizeText({
 *   botId: 'MyBot',
 *   botAliasId: 'ALIZAA',
 *   localeId: 'en_US',
 *   sessionId: 'user-123',
 *   text: 'Hello'
 * });
 * ```
 */

import { LexRuntimeV2Client, RecognizeTextCommand, RecognizeUtteranceCommand } from '@aws-sdk/client-lex-runtime-v2';
import { logger } from './logger.js';

class LexService {
  constructor() {
    this.client = new LexRuntimeV2Client({
      region: process.env.AWS_REGION || 'us-east-1'
    });
  }

  /**
   * Send text message to Lex bot
   * @param {Object} params - Parameters
   * @param {string} params.botId - Bot ID
   * @param {string} params.botAliasId - Bot Alias ID
   * @param {string} params.localeId - Locale ID (e.g., 'en_US')
   * @param {string} params.sessionId - Session ID (user identifier)
   * @param {string} params.text - User input text
   * @param {Object} [params.sessionState] - Optional session state
   * @returns {Promise<Object>} Lex response
   */
  async recognizeText({
    botId,
    botAliasId,
    localeId,
    sessionId,
    text,
    sessionState = {}
  }) {
    try {
      logger.debug('Lex.recognizeText called', { botId, sessionId, textLength: text.length });

      const command = new RecognizeTextCommand({
        botId,
        botAliasId,
        localeId,
        sessionId,
        text,
        sessionState: {
          ...sessionState,
          dialogAction: { type: 'ElicitIntent' }
        }
      });

      const response = await this.client.send(command);

      logger.debug('Lex.recognizeText response', {
        sessionId,
        dialogState: response.sessionState?.dialogAction?.type,
        messagesCount: response.messages?.length || 0
      });

      return this._formatResponse(response);
    } catch (error) {
      logger.error('Lex.recognizeText error', { botId, sessionId, error: error.message });
      throw error;
    }
  }

  /**
   * Recognize speech audio
   * @param {Object} params - Parameters
   * @param {string} params.botId - Bot ID
   * @param {string} params.botAliasId - Bot Alias ID
   * @param {string} params.localeId - Locale ID
   * @param {string} params.sessionId - Session ID
   * @param {Buffer} params.audioStream - Audio buffer
   * @param {string} [params.audioFormat='PCM'] - Audio format (PCM, OGG_VORBIS, etc.)
   * @returns {Promise<Object>} Lex response
   */
  async recognizeUtterance({
    botId,
    botAliasId,
    localeId,
    sessionId,
    audioStream,
    audioFormat = 'PCM'
  }) {
    try {
      logger.debug('Lex.recognizeUtterance called', { botId, sessionId, audioFormat });

      const command = new RecognizeUtteranceCommand({
        botId,
        botAliasId,
        localeId,
        sessionId,
        audioStream,
        audioFormat,
        requestAttributes: {
          nluConfidenceThreshold: '0.40'
        }
      });

      const response = await this.client.send(command);

      logger.debug('Lex.recognizeUtterance response', {
        sessionId,
        audioContentType: response.audioContentType
      });

      return this._formatResponse(response);
    } catch (error) {
      logger.error('Lex.recognizeUtterance error', { botId, sessionId, error: error.message });
      throw error;
    }
  }

  /**
   * Format Lex response for client consumption
   * @private
   */
  _formatResponse(response) {
    return {
      messages: response.messages?.map(m => ({
        type: m.contentType,
        content: m.content
      })) || [],
      sessionAttributes: response.sessionState?.sessionAttributes || {},
      dialogState: response.sessionState?.dialogAction?.type || 'ElicitIntent',
      intentName: response.sessionState?.intent?.name,
      intentState: response.sessionState?.intent?.state,
      responseCard: this._extractResponseCard(response.messages)
    };
  }

  /**
   * Extract response card from messages
   * @private
   */
  _extractResponseCard(messages = []) {
    const cardMessage = messages.find(m => m.contentType === 'application/vnd.amazonaws.card.generic');
    if (!cardMessage) return null;

    try {
      return JSON.parse(cardMessage.content);
    } catch (error) {
      logger.warn('Failed to parse response card', { error: error.message });
      return null;
    }
  }
}

export const lexService = new LexService();
