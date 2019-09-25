import { Transaction } from 'sequelize';
import { fromGlobalId } from 'graphql-relay';

import AppContext from '../context';
import { assertTrue, requireValue } from '../utils';

export default async function updateClassStudent(parent: null, { input }: any, { viewer, models, pubsub }: AppContext) {
  viewer = requireValue(viewer);

  const transaction = await models.sequelize.transaction({isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE});
  try {
    const classId = parseInt(fromGlobalId(input.classId).id);
    const studentId = parseInt(fromGlobalId(input.studentId).id);
    const isEleminated = input.isEleminated;
    const isAdvanced = input.isAdvanced;
    const clazz = requireValue(await models.Class.findByPk(classId));
    const mentor = await clazz.getMentor();
    assertTrue(viewer.id === mentor.id);
    const student = requireValue(await models.ClassStudent.findByPk(studentId));
    assertTrue(student.classId === classId);
    if (isEleminated != null) {
      student.isEleminated = isEleminated;
    }
    if (isAdvanced != null) {
      // student.isAdvanced = isAdvanced;
    }
    const updatedStudent = await student.save();
    transaction.commit();
    return {
        student: updatedStudent,
        clientMutationId: input.clientMutationId,
    };
  } catch (e) {
    await transaction.rollback()
    throw e;
  }
}