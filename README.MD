# Jotai state & React Router Search Params synchronization hook

Primary goal was to sync two sources of state with the least loss of abstraction.
* Only use React Router as a mean to subscribe for location (here: query params) updates
* End user code only reads and updates Jotai state (the atom)

Example sandbox: [codesandbox.io/p/github/lildeadprince/jotai-react-router-query](https://codesandbox.io/p/github/lildeadprince/jotai-react-router-query/main?file=%2Fexamples%2F01-basic%2Fsrc%2Ftest-route.jsx)
