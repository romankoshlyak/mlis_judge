'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn('classStudents', 'isAdvanced', {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false
        }, { transaction: t }),
        queryInterface.changeColumn('classStudents', 'isAdvanced', {
          type: Sequelize.BOOLEAN,
          allowNull: false
        }, { transaction: t}),
      ])
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('classStudents', 'isAdvanced', { transaction: t }),
      ])
    })
  }
};
