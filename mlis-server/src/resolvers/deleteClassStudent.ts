import { Transaction } from 'sequelize';
import { fromGlobalId } from 'graphql-relay';

import AppContext from '../context';
import { assertTrue, requireValue, getModelId } from '../utils';

export default async function deleteClassStudent(parent: null, { input }: any, { viewer, models }: AppContext) {
  viewer = requireValue(viewer);

  const transaction = await models.sequelize.transaction({isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE});
  try {
    const classId  = getModelId(input.classId, models.Class);
    const studentId = getModelId(input.studentId, models.ClassStudent);
    const clazz = requireValue(await models.Class.findByPk(classId));
    const mentor = await clazz.getMentor();
    assertTrue(viewer.id === mentor.id);
    const student = requireValue(await models.ClassStudent.findByPk(studentId));
    assertTrue(student.classId === classId);
    await student.destroy()
    transaction.commit();
    return {
        deletedStudentId: input.studentId,
        clientMutationId: input.clientMutationId,
    };
  } catch (e) {
    await transaction.rollback()
    throw e;
  }
}