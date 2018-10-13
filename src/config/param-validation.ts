import * as Joi from 'joi';

export default {
  // POST /api/users
  createUser: {
    body: {
      phoneNo: Joi.string().required(),
    }
  },
  // POST /api/posts
  createPost: {
    body: {
      title: Joi.string().required(),
    }
  },

  // UPDATE /api/users/:userId
  updateUser: {
    body: {
      username: Joi.string().required(),
      mobileNumber: Joi.string().regex(/^[1-9][0-9]{9}$/).required()
    },
    params: {
      userId: Joi.string().hex().required()
    }
  },

  // UPDATE /api/posts/:postId
  updatePost: {
    body: {
      title: Joi.string().required(),
    },
    params: {
      postId: Joi.string().hex().required()
    }
  },

  // POST /api/auth/login
  login: {
    body: {
      username: Joi.string().required(),
      password: Joi.string().required()
    }
  },

  // POST /api/createOrder
  createOrder: {
    body: {
      phoneNo: Joi.string().required(),
      username: Joi.string().required(),
    }
  },
  // POST /api/Contract
  createContract: {
    body: {
      orderid: Joi.string().required()
    }
  },

  createProjectItem: {
    body: {
      projectid: Joi.string().required()
    }
  }

};
