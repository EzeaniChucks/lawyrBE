import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
// import { jwtIsValid } from 'src/util';
import * as jwt from 'jsonwebtoken';
import { AdminService } from 'src/admin/admin.service';
import { jwtIsValid } from 'src/utils';
// import {check} from '../app.service'

// const fetchItemsPaths = [
//   '/admin/fetch_all_users/for_admin_settings',
//   '/admin/turn_user_to_subadmin',
//   '/admin/turn_subadmin_to_user',
// ];
const createItemsPaths = [
  //   '/admin/fetch_all_users/for_admin_settings',
  '/contents/create_super_folder',
  '/audios/upload_audio',
  '/docx_pdfs/upload_docx_pdf',
  '/essays/create_essay',
  '/flashcards/create_flashcard',
  '/mcqs/create_mcq',
  '/upload_videos/create_upload_video',
];

const updateItemsPaths = [
  //contents
  '/contents/update_single_content',
  '/contents/monify_resource',
  '/contents/unmonify_resource',
  //audios
  '/audios/replace_single_audio',
  '/audios/edit_single_audio_name',
  '/audios/edit_audio_details',

  //books
  '/docx_pdfs/replace_single_docx_pdf',
  '/docx_pdfs/edit_single_docx_pdf_name',
  '/docx_pdfs/edit_docx_pdf_details',

  //essays
  '/essays/update_essay',

  //flashcards
  '/flashcards/update_flashcard',

  //mcqs
  '/mcqs/update_mcq',

  //videos
  '/videos/update_video',
];

const deleteItemsPaths = [
  //audios
  '/audios/delete_single_audio',
  '/audios/delete_entire_audio_group/:parentaudioId',

  //books
  '/docx_pdfs/delete_single_docx_pdf',

  //essays
  '/essays/delete_essay/:essayId',

  //flashcards
  '/flashcards/delete_flashcard/:flashcardId',

  //mcqs
  '/mcqs/delete_mcq/:mcqId',

  //videos
  '/videos/delete_video/:videoId',
];

const cannotPerformActionOnSelf = async (res: Response) => {
  return res
    .status(400)
    .json({ msg: 'You cannot perform this action on yourself' });
};

@Injectable()
export class ForAdminContentManagement implements NestMiddleware {
  constructor(private readonly adminService: AdminService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    try {
      //   const token = req?.signedCookies?.accessToken;
      const token = req?.headers?.authorization?.split(' ')[1];

      if (!token) {
        throw new ForbiddenException('Forbidden request');
      }

      const isTokenValid = await jwtIsValid(token);

      if (isTokenValid) {
        //check if user is admin
        if (!isTokenValid?.isAdmin && !isTokenValid?.isSubAdmin) {
          return res.status(400).json({
            msg: 'Forbidden request',
          });
        }

        if (isTokenValid?.isSubAdmin) {
          const path = req.originalUrl;
          //   console.log('request path', req.originalUrl);
          let result = undefined;
          if (path === '/admin/turn_user_to_subadmin') {
            if (req?.body?.userId === isTokenValid?._id) {
              return cannotPerformActionOnSelf(res);
            }
            result = await this.adminService.checkSubAdminAccessEligibility(
              isTokenValid?._id,
              'can_create_other_subadmins',
            );
          }
          if (path === '/admin/turn_subadmin_to_user') {
            if (req?.body?.userId === isTokenValid?._id) {
              return await cannotPerformActionOnSelf(res);
            }
            result = await this.adminService.checkSubAdminAccessEligibility(
              isTokenValid?._id,
              'can_remove_other_subadmins',
            );
          }
          if (createItemsPaths.includes(path)) {
            result = await this.adminService.checkSubAdminAccessEligibility(
              isTokenValid?._id,
              'can_create_admin_content',
            );
          }
          if (updateItemsPaths.includes(path)) {
            result = await this.adminService.checkSubAdminAccessEligibility(
              isTokenValid?._id,
              'can_edit_admin_content',
            );
          }
          //for deletion, format path to remove the param dynamic variable at the last slash position
          let formateddeletionPath = path.split('/');
          formateddeletionPath.pop();
          if (deleteItemsPaths.includes(formateddeletionPath.join('/'))) {
            result = await this.adminService.checkSubAdminAccessEligibility(
              isTokenValid?._id,
              'can_delete_admin_content',
            );
          }

          if (result?.payload === false) {
            return res.status(400).json(result);
          }
        }

        req['decodedAdmin'] = isTokenValid;
        next();
      } else {
        return res.status(400).json({
          msg: 'Forbidden request',
        });
      }
    } catch (err) {
      throw new InternalServerErrorException({ msg: err.message });
    }
  }
}
