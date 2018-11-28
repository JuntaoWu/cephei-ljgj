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
      mobileNumber: Joi.string().regex(/^[1-9][0-9]{10}$/).required()
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
        
    }
  },
  // POST /api/Contract
  createContract: {
    body: {
      orderid: Joi.string().required()
    }
  },
  createReview: {
    body: {
      orderid: Joi.string().required()
    }
  },
  getOrderInfo: {
    query: {
      orderid: Joi.string().required()
    }
  },
  body: {
    projectid: Joi.string().required()
  },
  createProjectItem: {
    body: {
      projectid:Joi.string().required(),
      projectThumbUrl:Joi.string().required(),
      projectName:Joi.string().required()
    }
    },
    createGroupHouseItem: {
      body: {
        houseName:Joi.string().required(),
        houseAddress:Joi.string().required()
      }
      },
      getGroupBySearch: {
        body: {
          houseName:Joi.string().required()
        }
        },
      getGroupItem: {
        body: {
          groupid:Joi.string().required()
        }
    },createSubProjectDes: {
      body: {
        subProjectDesid:Joi.string().required()
      }
    },
    createProjectCase: {
      body: {
        caseid:Joi.string().required()
      }
    },
  // POST /api/auth/getVerificationCode
  getVerificationCode: {
    body: {
      phoneNo: Joi.string().regex(/^[1-9][0-9]{10}$/).required()
    }
  }

};
