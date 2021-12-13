import { useEffect, useState } from "react";
import {
  ActionFunction,
  Form,
  LoaderFunction,
  redirect,
  useActionData,
  useLoaderData,
  useTransition,
} from "remix";
import invariant from "tiny-invariant";
import { editPost, getPost } from "~/post";

type PostError = {
  title?: boolean;
  slug?: boolean;
  markdown?: boolean;
};

export const loader: LoaderFunction = async ({ params }) => {
  invariant(params.slug, "expected params.slug");
  return getPost(params.slug);
};

export const action: ActionFunction = async ({ request, params }) => {
  await new Promise((res) => setTimeout(res, 1000));

  const formData = await request.formData();

  const title = formData.get("title");
  const slug = formData.get("slug");
  const markdown = formData.get("markdown");

  const errors: PostError = {};
  if (!title) errors.title = true;
  if (!slug) errors.slug = true;
  if (!markdown) errors.markdown = true;

  if (Object.keys(errors).length) {
    return errors;
  }

  invariant(typeof title === "string");
  invariant(typeof slug === "string");
  invariant(typeof markdown === "string");
  invariant(params.slug, "expected params.slug");
  await editPost({ title, slug, markdown, currentSlug: params.slug });

  return redirect("/admin");
};

export default function NewPost() {
  const post = useLoaderData();
  const errors = useActionData();
  const transition = useTransition();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    setTitle(post.title);
    setSlug(post.slug);
    setBody(post.body);
  }, [post]);

  return (
    <Form method="post">
      <p>
        <label>
          Post Title: {errors?.title && <em>Title is required</em>}{" "}
          <input
            type="text"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
      </p>
      <p>
        <label>
          Post Slug: {errors?.slug && <em>Slug is required</em>}{" "}
          <input
            type="text"
            name="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
        </label>
      </p>
      <p>
        <label htmlFor="markdown">Markdown:</label>
        {errors?.markdown && <em>Markdown is required</em>}
        <br />
        <textarea
          id="markdown"
          rows={20}
          name="markdown"
          value={body}
          style={{ width: "100%" }}
          onChange={(e) => setBody(e.target.value)}
        />
      </p>
      <p>
        <button type="submit">
          {transition.submission ? "Updating..." : "Update Post"}
        </button>
      </p>
    </Form>
  );
}
