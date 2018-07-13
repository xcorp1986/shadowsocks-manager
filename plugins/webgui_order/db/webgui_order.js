const knex = appRequire('init/knex').knex;
const tableName = 'webgui_order';

const addDefaultOrder = async () => {
  const data = await knex('webgui_order').where({}).then(s => s[0]);
  if(!data) {
    const oldData = await knex('webguiSetting').where({ key: 'payment' }).then(s => JSON.parse(s[0].value));
    const types = {
      2: 'week',
      3: 'month',
      4: 'day',
      5: 'hour',
      6: 'season',
      7: 'year',
    };
    const insertData = [];
    for(const type in types) {
      let cycle = 1;
      if(type === 6) { cycle = 3; }
      if(type === 7) { cycle = 12; }
      insertData.push({
        id: type,
        name: oldData[types[type]].orderName || types[type],
        type: type <= 5 ? type : 3,
        cycle,
        alipay: oldData[types[type]].alipay || 99,
        paypal: oldData[types[type]].paypal || 99,
        autoRemove: oldData[types[type]].autoRemove ? 1 : 0,
        multiServerFlow: oldData[types[type]].multiServerFlow ? 1 : 0,
        changeOrderType: 1,
        flow: oldData[types[type]].flow * 1000 * 1000 || 1000 * 1000 * 1000,
        server: oldData[types[type]].server ? JSON.stringify(oldData[types[type]].server) : null,
        refTime: 0,
      });
    }
    await knex(tableName).insert(insertData);
  }
  return;
};

const createTable = async () => {
  const exist = await knex.schema.hasTable(tableName);
  if(exist) {
    await addDefaultOrder();
    return;
  }
  await knex.schema.createTableIfNotExists(tableName, function(table) {
    table.increments('id').primary();
    table.string('name');
    table.string('comment').defaultTo('');
    table.integer('type');
    table.integer('cycle');
    table.float('alipay');
    table.float('paypal');
    table.bigInteger('flow');
    table.integer('refTime');
    table.string('server');
    table.integer('autoRemove').defaultTo(0);
    table.integer('multiServerFlow').defaultTo(0);
    table.integer('changeOrderType').defaultTo(0);
  });
  await addDefaultOrder();
  return;
};

exports.createTable = createTable;
