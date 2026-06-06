import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "../button"
import { dayjs } from "../../const"
import { LazyDiv } from "../lazyDiv"
import { useModal } from "../modal"
import { SERVER_URL } from "../../env"

const RULES = {
  name: {
    maxLength: 10,
  },
  content: {
    maxLength: 100,
  },
  password: {
    minLength: 4,
    maxLength: 20,
  },
}

const PAGES_PER_BLOCK = 5
const POSTS_PER_PAGE = 5
const LOCAL_GUESTBOOK_KEY = "wedding-invitation:guestbook"

const getTotalPages = (total: number) =>
  Math.max(1, Math.ceil(total / POSTS_PER_PAGE))

type Post = {
  id: number
  timestamp: number
  name: string
  content: string
}

type LocalPost = Post & {
  password: string
}

const getLocalPosts = (): LocalPost[] => {
  try {
    const value = window.localStorage.getItem(LOCAL_GUESTBOOK_KEY)
    if (!value) return []

    const posts = JSON.parse(value)
    if (!Array.isArray(posts)) return []

    return posts.filter(
      (post): post is LocalPost =>
        typeof post.id === "number" &&
        typeof post.timestamp === "number" &&
        typeof post.name === "string" &&
        typeof post.content === "string" &&
        typeof post.password === "string",
    )
  } catch {
    return []
  }
}

const saveLocalPosts = (posts: LocalPost[]) => {
  window.localStorage.setItem(LOCAL_GUESTBOOK_KEY, JSON.stringify(posts))
}

const toPublicPost = (post: LocalPost): Post => ({
  id: post.id,
  timestamp: post.timestamp,
  name: post.name,
  content: post.content,
})

const loadLocalPosts = (offset: number, limit: number) => {
  const posts = getLocalPosts().map(toPublicPost)

  return {
    posts: posts.slice(offset, offset + limit),
    total: posts.length,
  }
}

const createLocalPost = (name: string, content: string, password: string) => {
  const posts = getLocalPosts()
  const id = Math.max(0, ...posts.map((post) => post.id)) + 1

  saveLocalPosts([
    {
      id,
      timestamp: dayjs().unix(),
      name,
      content,
      password,
    },
    ...posts,
  ])
}

const deleteLocalPost = (id: number, password: string) => {
  const posts = getLocalPosts()
  const post = posts.find((post) => post.id === id)

  if (!post) {
    throw new Error("POST_NOT_FOUND")
  }

  if (post.password !== password) {
    throw new Error("INCORRECT_PASSWORD")
  }

  saveLocalPosts(posts.filter((post) => post.id !== id))
}

export const GuestBook = () => {
  const { openModal, closeModal } = useModal()

  const [posts, setPosts] = useState<Post[]>([])

  const loadPosts = async () => {
    if (SERVER_URL) {
      try {
        const res = await fetch(
          `${SERVER_URL}/guestbook?offset=${0}&limit=${3}`,
        )
        if (res.ok) {
          const data = await res.json()

          setPosts(data.posts)
          return
        }
      } catch (error) {
        console.error("Error loading posts:", error)
      }

      setPosts([])
      return
    }

    setPosts(loadLocalPosts(0, 3).posts)
  }

  useEffect(() => {
    loadPosts()
  }, [])

  return (
    <LazyDiv className="card guestbook">
      <h2 className="english">Guest Book</h2>

      <div className="break" />

      {posts.map((post) => (
        <div key={post.id} className="post">
          <div className="heading">
            <button
              className="close-button"
              onClick={async () => {
                openModal({
                  className: "delete-guestbook-modal",
                  closeOnClickBackground: false,
                  header: <div className="title">삭제하시겠습니까?</div>,
                  content: (
                    <DeleteGuestBookModal
                      postId={post.id}
                      onSuccess={() => {
                        loadPosts()
                      }}
                    />
                  ),
                  footer: (
                    <>
                      <Button
                        buttonStyle="style2"
                        type="submit"
                        form="guestbook-delete-form"
                      >
                        삭제하기
                      </Button>
                      <Button
                        buttonStyle="style2"
                        className="bg-light-grey-color text-dark-color"
                        onClick={closeModal}
                      >
                        닫기
                      </Button>
                    </>
                  ),
                })
              }}
            />
          </div>
          <div className="body">
            <div className="title">
              <div className="name">{post.name}</div>
              <div className="date">
                {dayjs.unix(post.timestamp).format("YYYY-MM-DD")}
              </div>
            </div>
            <div className="content">{post.content}</div>
          </div>
        </div>
      ))}

      <div className="break" />

      <Button
        onClick={() =>
          openModal({
            className: "write-guestbook-modal",
            closeOnClickBackground: false,
            header: (
              <div className="title-group">
                <div className="title">방명록 작성하기</div>
                <div className="subtitle">
                  신랑, 신부에게 축하의 마음을 전해주세요.
                </div>
              </div>
            ),
            content: <WriteGuestBookModal loadPosts={loadPosts} />,
            footer: (
              <>
                <Button
                  buttonStyle="style2"
                  type="submit"
                  form="guestbook-write-form"
                >
                  저장하기
                </Button>
                <Button
                  buttonStyle="style2"
                  className="bg-light-grey-color text-dark-color"
                  onClick={closeModal}
                >
                  닫기
                </Button>
              </>
            ),
          })
        }
      >
        방명록 작성하기
      </Button>
      <div className="break" />

      <Button
        onClick={() =>
          openModal({
            className: "all-guestbook-modal",
            closeOnClickBackground: true,
            header: <div className="title">방명록 전체보기</div>,
            content: <AllGuestBookModal loadPosts={loadPosts} />,
            footer: (
              <Button
                buttonStyle="style2"
                className="bg-light-grey-color text-dark-color"
                onClick={closeModal}
              >
                닫기
              </Button>
            ),
          })
        }
      >
        방명록 전체보기
      </Button>
    </LazyDiv>
  )
}

const WriteGuestBookModal = ({ loadPosts }: { loadPosts: () => void }) => {
  const inputRef = useRef({}) as React.RefObject<{
    name: HTMLInputElement
    content: HTMLTextAreaElement
    password: HTMLInputElement
  }>
  const { closeModal } = useModal()
  const [loading, setLoading] = useState(false)

  return (
    <form
      id="guestbook-write-form"
      className="form"
      onSubmit={async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
          const name = inputRef.current.name.value.trim()
          const content = inputRef.current.content.value.trim()
          const password = inputRef.current.password.value

          if (!name) {
            alert("이름을 입력해주세요.")
            return
          }
          if (name.length > RULES.name.maxLength) {
            alert(`이름을 ${RULES.name.maxLength}자 이하로 입력해주세요.`)
            return
          }

          if (!content) {
            alert("내용을 입력해주세요.")
            return
          }
          if (content.length > RULES.content.maxLength) {
            alert(`내용을 ${RULES.content.maxLength}자 이하로 입력해주세요.`)
            return
          }

          if (password.length < RULES.password.minLength) {
            alert(`비밀번호를 ${RULES.password.minLength}자 이상 입력해주세요.`)
            return
          }
          if (password.length > RULES.password.maxLength) {
            alert(
              `비밀번호를 ${RULES.password.maxLength}자 이하로 입력해주세요.`,
            )
            return
          }

          let saved = false

          if (SERVER_URL) {
            try {
              const res = await fetch(`${SERVER_URL}/guestbook`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, content, password }),
              })

              if (res.ok) {
                saved = true
              }
            } catch (error) {
              console.error("Error creating post:", error)
            }

            if (!saved) {
              throw new Error("SERVER_CREATE_FAILED")
            }
          } else {
            createLocalPost(name, content, password)
          }

          alert("방명록 작성이 완료되었습니다.")
          closeModal()
          loadPosts()
        } catch {
          alert("방명록 작성에 실패했습니다.")
        } finally {
          setLoading(false)
        }
      }}
    >
      이름
      <input
        disabled={loading}
        type="text"
        placeholder="이름을 입력해주세요."
        className="name"
        ref={(ref) => {
          inputRef.current.name = ref as HTMLInputElement
        }}
        maxLength={RULES.name.maxLength}
      />
      내용
      <textarea
        disabled={loading}
        placeholder="축하 메세지를 100자 이내로 입력해주세요."
        className="content"
        ref={(ref) => {
          inputRef.current.content = ref as HTMLTextAreaElement
        }}
        maxLength={RULES.content.maxLength}
      />
      비밀번호
      <input
        disabled={loading}
        type="password"
        placeholder="비밀번호를 입력해주세요."
        className="password"
        ref={(ref) => {
          inputRef.current.password = ref as HTMLInputElement
        }}
        maxLength={RULES.password.maxLength}
      />
    </form>
  )
}

const AllGuestBookModal = ({
  loadPosts,
}: {
  loadPosts: () => Promise<void>
}) => {
  const [posts, setPosts] = useState<Post[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const { openModal, closeModal } = useModal()

  const loadPage = async (page: number) => {
    setCurrentPage(page)
    if (SERVER_URL) {
      try {
        const offset = page * POSTS_PER_PAGE
        const res = await fetch(
          `${SERVER_URL}/guestbook?offset=${offset}&limit=${POSTS_PER_PAGE}`,
        )
        if (res.ok) {
          const data = await res.json()

          const nextTotalPages = getTotalPages(data.total)

          setPosts(data.posts)
          setTotalPages(nextTotalPages)
          if (data.total < offset) {
            setCurrentPage(nextTotalPages - 1)
          }
          return
        }
      } catch (error) {
        console.error("Error loading posts:", error)
      }

      setPosts([])
      setTotalPages(1)
      return
    }

    const localGuestbook = loadLocalPosts(
      page * POSTS_PER_PAGE,
      POSTS_PER_PAGE,
    )
    setPosts(localGuestbook.posts)
    setTotalPages(getTotalPages(localGuestbook.total))
  }

  useEffect(() => {
    loadPage(0)
  }, [])

  const pages = useMemo(() => {
    const start = Math.floor(currentPage / PAGES_PER_BLOCK) * PAGES_PER_BLOCK
    const end = Math.min(start + PAGES_PER_BLOCK, totalPages)

    return Array.from({ length: end - start }).map((_, index) => index + start)
  }, [currentPage, totalPages])

  return (
    <>
      {posts.map((post) => (
        <div key={post.id} className="post">
          <div className="heading">
            <div
              className="close-button"
              onClick={async () => {
                openModal({
                  className: "delete-guestbook-modal",
                  closeOnClickBackground: false,
                  header: <div className="title">삭제하시겠습니까?</div>,
                  content: (
                    <DeleteGuestBookModal
                      postId={post.id}
                      onSuccess={() => {
                        loadPosts()
                        loadPage(currentPage)
                      }}
                    />
                  ),
                  footer: (
                    <>
                      <Button
                        buttonStyle="style2"
                        type="submit"
                        form="guestbook-delete-form"
                      >
                        삭제하기
                      </Button>
                      <Button
                        buttonStyle="style2"
                        className="bg-light-grey-color text-dark-color"
                        onClick={closeModal}
                      >
                        닫기
                      </Button>
                    </>
                  ),
                })
              }}
            />
          </div>
          <div className="body">
            <div className="title">
              <div className="name">{post.name}</div>
              <div className="date">
                {dayjs.unix(post.timestamp).format("YYYY-MM-DD")}
              </div>
            </div>
            <div className="content">{post.content}</div>
          </div>
        </div>
      ))}

      <div className="break" />

      <div className="pagination">
        {pages[0] > 0 && (
          <div
            className="page"
            onClick={() => {
              loadPage(pages[0] - 1)
            }}
          >
            이전
          </div>
        )}
        {pages.map((page) => (
          <div
            className={`page${page === currentPage ? " current" : ""}`}
            key={page}
            onClick={() => {
              if (page === currentPage) return
              loadPage(page)
            }}
          >
            {page + 1}
          </div>
        ))}
        {pages[pages.length - 1] < totalPages - 1 && (
          <div
            className="page"
            onClick={() => {
              loadPage(pages[pages.length - 1] + 1)
            }}
          >
            다음
          </div>
        )}
      </div>
    </>
  )
}

const DeleteGuestBookModal = ({
  postId,
  onSuccess,
}: {
  postId: number
  onSuccess: () => void
}) => {
  const inputRef = useRef({} as HTMLInputElement)
  const { closeModal } = useModal()
  const [loading, setLoading] = useState(false)

  return (
    <form
      id="guestbook-delete-form"
      className="form"
      onSubmit={async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
          const password = inputRef.current.value
          if (!password || password.length < RULES.password.minLength) {
            alert(`비밀번호를 ${RULES.password.minLength}자 이상 입력해주세요.`)
            return
          }

          if (password.length > RULES.password.maxLength) {
            alert(
              `비밀번호를 ${RULES.password.maxLength}자 이하로 입력해주세요.`,
            )
            return
          }

          let deleted = false

          if (SERVER_URL) {
            try {
              const result = await fetch(`${SERVER_URL}/guestbook`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: postId, password }),
              })

              if (result.ok) {
                deleted = true
              } else if (result.status === 403) {
                alert("비밀번호가 일치하지 않습니다.")
                return
              }
            } catch (error) {
              console.error("Error deleting post:", error)
            }

            if (!deleted) {
              alert("방명록 삭제에 실패했습니다.")
              return
            }
          } else {
            try {
              deleteLocalPost(postId, password)
            } catch (error) {
              if (
                error instanceof Error &&
                error.message === "INCORRECT_PASSWORD"
              ) {
                alert("비밀번호가 일치하지 않습니다.")
              } else {
                alert("방명록 삭제에 실패했습니다.")
              }
              return
            }
          }

          alert("삭제되었습니다.")
          closeModal()
          onSuccess()
        } catch {
          alert("방명록 삭제에 실패했습니다.")
        } finally {
          setLoading(false)
        }
      }}
    >
      <input
        disabled={loading}
        type="password"
        placeholder="비밀번호를 입력해주세요."
        className="password"
        ref={inputRef}
        maxLength={RULES.password.maxLength}
      />
    </form>
  )
}
