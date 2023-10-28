const traverseFolderTreeWithQueue = (payload) => {
  const queue = [payload?.data];
  const result = []; //will be an array of arrays. 2D
  while (queue.length) {
    let len = queue.length;
    result.push(
      queue.map((eachCont) => {
        return {
          ...eachCont,
          children: [],
          subscribedUsersIds: [
            ...eachCont?.subscribedUsersIds.filter((eachSub) => {
              return eachSub?.toString() !== payload?.userId;
            }),
          ],
        };
      }),
    );
    while (len--) {
      let node = queue.shift();
      if (node) {
        for (let child of node.children) {
          queue.push(child);
        }
      }
    }
  }
  return result;
};

process.on('message', (payload) => {
  let result;
  result = traverseFolderTreeWithQueue(payload);

  //now rebuild tree with the 2D array from above
  if (result) {
    let secondtoLastArray = [];
    for (let i = result.length - 1; i > 0; i--) {
      //start iterating from the last kids innerarray in the 2D array. Help each one find their parents
      secondtoLastArray = result[i - 1]; //direct parent array
      for (let j = 0; j < result[i].length; j++) {
        //iterate though each child object
        for (let k = 0; k < secondtoLastArray.length; k++) {
          if (
            result[i][j]?.parentIds?.includes(
              secondtoLastArray[k]?._id.toString(),
            )
          ) {
            secondtoLastArray[k]?.children.push(result[i][j]);
          }
        }
      }
    }
    if (result.length === 1) {
      secondtoLastArray = result[0];
    }
    // console.log(secondtoLastArray);
    return process.send(secondtoLastArray[0]);
  }
});
