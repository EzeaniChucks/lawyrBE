process.on('message', async (vids) => {
  const videos = vids?.map((eachVid) => {
    const { _id, name, secure_url, resource_type, format } = eachVid;
    return {
      _id,
      name,
      src: secure_url,
      type: `${resource_type}/${format}`,
    };
  });
  process.send(videos);
});
