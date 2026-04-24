'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const txTable = 'transactions';
    const appTable = 'job_applications';

    let txDesc = null;
    try {
      txDesc = await queryInterface.describeTable(txTable);
    } catch (e) {
      txDesc = null;
    }

    if (txDesc) {
      if (!txDesc.job_id) {
        await queryInterface.addColumn(txTable, 'job_id', {
          type: Sequelize.UUID,
          allowNull: true,
        });
      }
      if (!txDesc.reference_id) {
        await queryInterface.addColumn(txTable, 'reference_id', {
          type: Sequelize.STRING(128),
          allowNull: true,
        });
      }
      if (!txDesc.original_amount) {
        await queryInterface.addColumn(txTable, 'original_amount', {
          type: Sequelize.DECIMAL(18, 6),
          allowNull: true,
        });
      }
      if (!txDesc.original_currency) {
        await queryInterface.addColumn(txTable, 'original_currency', {
          type: Sequelize.STRING(10),
          allowNull: true,
        });
      }
      if (!txDesc.converted_amount) {
        await queryInterface.addColumn(txTable, 'converted_amount', {
          type: Sequelize.DECIMAL(18, 6),
          allowNull: true,
        });
      }
      if (!txDesc.converted_currency) {
        await queryInterface.addColumn(txTable, 'converted_currency', {
          type: Sequelize.STRING(10),
          allowNull: true,
        });
      }
      if (!txDesc.exchange_rate) {
        await queryInterface.addColumn(txTable, 'exchange_rate', {
          type: Sequelize.DECIMAL(20, 10),
          allowNull: true,
        });
      }
      if (!txDesc.fx_timestamp) {
        await queryInterface.addColumn(txTable, 'fx_timestamp', {
          type: Sequelize.DATE,
          allowNull: true,
        });
      }
      if (!txDesc.fx_provider) {
        await queryInterface.addColumn(txTable, 'fx_provider', {
          type: Sequelize.STRING(50),
          allowNull: true,
          defaultValue: 'fxapi.app',
        });
      }
      if (!txDesc.metadata) {
        await queryInterface.addColumn(txTable, 'metadata', {
          type: Sequelize.JSON,
          allowNull: true,
        });
      }
    }

    let appDesc = null;
    try {
      appDesc = await queryInterface.describeTable(appTable);
    } catch (e) {
      appDesc = null;
    }

    if (appDesc && !appDesc.preferred_payout_currency) {
      await queryInterface.addColumn(appTable, 'preferred_payout_currency', {
        type: Sequelize.STRING(10),
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const txTable = 'transactions';
    const appTable = 'job_applications';

    let txDesc = null;
    try {
      txDesc = await queryInterface.describeTable(txTable);
    } catch (e) {
      txDesc = null;
    }
    if (txDesc) {
      const txColumns = [
        'metadata',
        'fx_provider',
        'fx_timestamp',
        'exchange_rate',
        'converted_currency',
        'converted_amount',
        'original_currency',
        'original_amount',
        'reference_id',
        'job_id',
      ];
      for (const col of txColumns) {
        if (txDesc[col]) {
          await queryInterface.removeColumn(txTable, col);
        }
      }
    }

    let appDesc = null;
    try {
      appDesc = await queryInterface.describeTable(appTable);
    } catch (e) {
      appDesc = null;
    }
    if (appDesc && appDesc.preferred_payout_currency) {
      await queryInterface.removeColumn(appTable, 'preferred_payout_currency');
    }
  },
};
