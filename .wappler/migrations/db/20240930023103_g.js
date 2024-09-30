
exports.up = function(knex) {
  return knex.schema
    .dropTable('users')

};

exports.down = function(knex) {
  return knex.schema
    .createTable('users', async function (table) {
      table.increments('id').primary().notNullable();
      table.string('users', 255);
      table.string('pass', 255);
    })
};
