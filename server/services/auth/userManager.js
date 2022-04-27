class UserManager {
  database = null;

  constructor(database) {
    this.database = database;
  }

  async getUsers() {
    return await this.database('user')
      .leftJoin('role', 'user.roleId', 'role.id')
      .leftJoin('organization', 'user.organizationId', 'organization.id')
      .select('user.*', 'role.name as roleName', 'organization.name as organizationName')
      .orderBy('user.id');
  }

  async getUser(userId) {
    const user = await this.database('user')
      .leftJoin('role', 'user.roleId', 'role.id')
      .leftJoin('organization', 'user.organizationId', 'organization.id')
      .where({ 'user.id': userId })
      .select('user.*', 'role.name as roleName', 'organization.name as organizationName')
      .first();

    user.rolePolicies = await this.getUserRolePolicies(userId);
    return user;
  }

  async addUser(user) {
    const userExists = await this.database('user').where({ name: user.name });
    if (userExists && userExists.length > 0) {
      throw new Error('User already exists');
    } else {
      let params = {
        roleId: user.roleId,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        status: user.status,
        organizationId: user.organizationId,
        organizationOther: user.organizationOther,
      };
  
      for (let key in params) {
        if ([null, undefined, ''].includes(params[key])) {
          delete params[key];
        }
      }

      if (Object.keys(params).length > 0) {
        await this.database('user').insert(params);
        return true;
      } else {
        return false;
      }
    }
  }

  async updateUser(user) {
    let params = {
      id: user.id,
      roleId: user.roleId,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      status: user.status,
      organizationId: user.organizationId,
      organizationOther: user.organizationOther,
    };

    for (let key in params) {
      if ([null, undefined, ''].includes(params[key])) {
        delete params[key];
      }
    }

    if (Object.keys(params).length > 0) {
      await this.database('user')
        .where({ id: user.id })
        .update(params);
      return true;
    } else {
      return false;
    }
  }

  async removeUser(userId) {
    return await this.database('user').where({ id: userId }).delete();
  }

  async getUserRolePolicies(userId) {
    return await this.database('user')
      .innerJoin('role', 'user.roleId', 'role.id')
      .innerJoin('rolePolicy', 'role.id', 'rolePolicy.roleId')
      .select('rolePolicy.*')
      .where({ 'user.id': userId });
  }
}

module.exports = UserManager;
