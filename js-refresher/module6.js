// Asynchronous JS & Error Handling

// 1. Simulated Async Call

const fetchUser = (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id === '1') {
        resolve({ id: 1, name: 'Alice' });
      } else {
        reject(new Error('User not found'));
      }
    }, 5000);
  });
};

const fetchPost = (id) => {
  return fetch(`https://jsonplaceholder.typicode.com/posts/${id}`).then(
    (response) => {
      if (!response.ok) {
        throw new Error('Post not found');
      }
      return response.json();
    }
  );
};

// using the promise api to fetch user
// async function handleUserRequest(userId) {
//   return fetchUser(userId)
//     .then((user) => {
//       console.log('Fetched user:', user);
//     })
//     .catch((error) => {
//       console.error('Error fetching user:', error);
//       throw error;
//     })
//     .finally(() => {
//       console.log('Finished fetching user');
//     });
// }

// async/await with error handling

// async function handleUserRequest(userId) {
//   try {
//     console.log('Fetching user...');
//     const user = await fetchUser(userId);
//     console.log('Fetched user:', user);
//   } catch (error) {
//     console.error('Error fetching user:', error);
//   } finally {
//     console.log('Finished fetching user');
//   }
// }

async function fetchUserAndPost(userId, postId) {
  try {
    console.log('Fetching user and post...');

    const response = await Promise.allSettled([
      fetchUser(userId),
      fetchPost(postId),
    ]);

    console.log('Fetched response:', response);
  } catch (error) {
    console.error('Error fetching user or post:', error);
  } finally {
    console.log('Finished fetching user and post');
  }
}

fetchUserAndPost('1', '1');
