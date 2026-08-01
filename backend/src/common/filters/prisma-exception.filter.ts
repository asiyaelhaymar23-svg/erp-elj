import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '@prisma/client';

// Sans ce filtre, une contrainte Prisma (enregistrement introuvable,
// doublon, référence invalide) remonte comme une erreur 500 brute avec la
// trace interne exposée au client. On la traduit ici en réponse HTTP propre.
@Catch(Prisma.PrismaClientKnownRequestError, Prisma.PrismaClientValidationError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError | Prisma.PrismaClientValidationError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    if (exception instanceof Prisma.PrismaClientValidationError) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Requête invalide.',
        error: 'Bad Request',
      });
    }

    switch (exception.code) {
      case 'P2025': // enregistrement introuvable (update/delete sur un id inexistant)
        return res.status(HttpStatus.NOT_FOUND).json({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Ressource introuvable.',
          error: 'Not Found',
        });
      case 'P2002': { // contrainte unique violée
        const champs = (exception.meta?.target as string[] | undefined)?.join(', ');
        return res.status(HttpStatus.CONFLICT).json({
          statusCode: HttpStatus.CONFLICT,
          message: champs ? `Une valeur existe déjà pour : ${champs}.` : 'Cette valeur existe déjà.',
          error: 'Conflict',
        });
      }
      case 'P2003': // clé étrangère invalide
        return res.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Référence invalide : l\'élément lié n\'existe pas.',
          error: 'Bad Request',
        });
      default:
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Erreur interne.',
          error: 'Internal Server Error',
        });
    }
  }
}
