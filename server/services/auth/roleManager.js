export class RoleManager {
  database = null;

  constructor(database) {
    this.database = database;
  }

  async getRole(roleId) {
    return await this
      .database('role')
      .where({id: roleId})
      .first();
  }

  async addRole(role) {
    return await this
      .database('role')
      .insert(role);
  }

  async updateRole(role) {
    return await this
      .database('role')
      .where({id: role.id})
      .update(role);
  }

  async removeRole(roleId) {
    return await this
      .database('role')
      .where({id: roleId})
      .delete();
  }

  async getRolePolicies(roleId) {
    return await this
      .database('role')
      .innerJoin('rolePolicy', 'role.id', 'rolePolicy.roleId')
      .select('rolePolicy.*')
      .where({'role.id': roleId});
  }

  async addRolePolicy(rolePolicy) {
    return await this
      .database('rolePolicy')
      .insert(rolePolicy);
  }

  async updateRolePolicy(rolePolicy) {
    return await this
      .database('rolePolicy')
      .where({id: rolePolicy.id})
      .update(rolePolicy);
  }

  async deleteRolePolicy(rolePolicyId) {
    return await this
      .database('rolePolicy')
      .where({id: rolePolicyId})
      .delete();
  }
}