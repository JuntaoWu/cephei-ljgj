
import { Request, Response } from 'express';
import { default as PostModel, Post } from '../models/post.model';

export let load = (params) => {
  return PostModel.findById(params.id);
}

export let get = (req: Request, res: Response) => {
  return load({ id: req.params.postId });
}

export let create = async (req, res, next) => {
  try {
    const post = new PostModel({
      title: req.body.title,
      content: req.body.content
    });
    await post.save();
    return res.json({
      error: false,
      message: "OK"
    });
  } catch (error) {
    return res.json({
      error: true,
      message: error.message
    });
  }

}

export let update = (params) => {
  return load(params).then(post => {
    const tmp = post;
    post.title = params.data.title;
    post.content = params.data.content;
    return post.save()
  });
};

export let list = (params) => {
  console.log("post: list");
  const { limit = 50, skip = 0 } = params;
  return PostModel.find().limit(limit).skip(skip);
};

export let remove = (params) => {
  return load(params).then(post => post.remove());
};
