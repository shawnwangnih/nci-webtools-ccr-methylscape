class UserManager {
  database = null;

  constructor(database) {
    this.database = database;
  }

  async getUser(userId) {
    return await this.database('user').where({ id: userId }).first();
  }

  async addUser(user) {
    return await this.database('user').insert(user);
  }

  async updateUser(user) {
    return await this.database('user').where({ id: user.id }).update(user);
  }

  async removeUser(userId) {
    return await this.database('user').where({ id: userId }).delete();
  }

  async getUserRoles(userId) {
    return await this.database('user')
      .innerJoin('userRole', 'user.id', 'userRole.userId')
      .innerJoin('role', 'userRole.roleId', 'role.id')
      .select('role.*')
      .where({ 'user.id': userId });
  }

  async getUserPolicies(userId) {
    return await this.database('user')
      .innerJoin('userRole', 'user.id', 'userRole.userId')
      .innerJoin('role', 'userRole.roleId', 'role.id')
      .innerJoin('rolePolicy', 'role.id', 'rolePolicy.roleId')
      .select('role.name', 'policy.*')
      .where({ 'user.id': userId });
  }
}

module.exports = UserManager;
