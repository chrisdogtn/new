
exports.up = function(knex) {
  return knex.schema
    .createTable('users', async function (table) {
      table.increments('id');
      table.string('users');
      table.string('pass');
    })

};

exports.down = function(knex) {
  return knex.schema
    .dropTable('users')
};
