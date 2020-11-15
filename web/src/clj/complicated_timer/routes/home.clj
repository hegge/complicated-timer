(ns complicated-timer.routes.home
  (:require
   [complicated-timer.layout :as layout]
   [clojure.data.json :as json]
   [clojure.java.io :as io]
   [clojure.string :as str]
   [clojure.tools.logging :as log]
   [complicated-timer.middleware :as middleware]
   [ring.util.response]
   [ring.util.http-response :as response]))

(defn home-page [request]
  (layout/render request "home.html"))

(defn sessions [request]
  (let [sessions [{
                   :name "2x3 x7\" :3'"
                   :description "Max weight dead-hangs"
                   :entries [{
                              :type "repeat"
                              :repetitions 2
                              :description "Sets"
                              :group [{
                                       :type "countdown"
                                       :category "pause"
                                       :duration 300
                                       :pauseWhenComplete true
                                       :skip [1]
                                       }
                                      {
                                       :type "repeat"
                                       :repetitions 3
                                       :description "Reps"
                                       :group [{
                                                :type "countdown"
                                                :category "pause"
                                                :duration 180
                                                :pauseWhenComplete true
                                                :skip [1]
                                                }
                                               {
                                                :type "countdown"
                                                :category "prepare"
                                                :duration 20
                                                }
                                               {
                                                :type "countdown"
                                                :category "work"
                                                :duration 7
                                                }
                                               ]
                                       }]
                              }]
                   }
                  {
                   :name "3x7 x7\" :3\"/3'"
                   :description "Intermittent dead-hangs"
                   :entries [{
                              :type "repeat"
                              :repetitions 3
                              :description "Sets"
                              :group [{
                                       :type "countdown"
                                       :category "pause"
                                       :duration 180
                                       :pauseWhenComplete true
                                       :skip [1]
                                       }
                                      {
                                       :type "countdown"
                                       :category "prepare"
                                       :duration 20
                                       }
                                      {
                                       :type "repeat"
                                       :repetitions 7
                                       :description "Reps"
                                       :group [{
                                                :type "countdown"
                                                :category "pause"
                                                :duration 3
                                                :skip [1]
                                                }
                                               {
                                                :type "countdown"
                                                :category "work"
                                                :duration 7
                                                }]
                                       }]
                              }]
                   }
                  {
                   :name "6x5 x6\" :10\"/2'"
                   :description "Intermittent dead-hangs"
                   :entries [{
                              :type "repeat"
                              :repetitions 6
                              :description "Sets"
                              :group [{
                                       :type "countdown"
                                       :category "pause"
                                       :duration 120
                                       :pauseWhenComplete true
                                       :skip [1]
                                       }
                                      {
                                       :type "countdown"
                                       :category "prepare"
                                       :duration 20
                                       }
                                      {
                                       :type "repeat"
                                       :repetitions 5
                                       :description "Reps"
                                       :group [{
                                                :type "countdown"
                                                :category "pause"
                                                :duration 10
                                                :skip [1]
                                                }
                                               {
                                                :type "countdown"
                                                :category "work"
                                                :duration 6
                                                }]
                                       }]
                              }]
                   }
                  {
                   :name "4x4 :3'"
                   :description "Fixed length intervals"
                   :entries [{
                              :type "repeat"
                              :repetitions 4
                              :description "Reps"
                              :group [{
                                       :type "countdown"
                                       :category "work"
                                       :duration 240
                                       }
                                      {
                                       :type "countdown"
                                       :category "pause"
                                       :duration 180
                                       :skip [-1]
                                       }]
                              }]
                   }
                  {
                   :name "2x3 :2'"
                   :description "Pauses between variable length exercises"
                   :entries [{
                              :type "repeat"
                              :repetitions 2
                              :description "Sets"
                              :group [{
                                       :type "repeat"
                                       :repetitions 3
                                       :description "Reps"
                                       :group [{
                                                :type "countdown"
                                                :category "pause"
                                                :duration 120
                                                :skip [1]
                                                :pauseWhenComplete true
                                                }]
                                       }
                                      {
                                       :type "countdown"
                                       :category "pause"
                                       :duration 180
                                       :skip [-1]
                                       :pauseWhenComplete true
                                       }]
                              }]
                   }
                  {
                   :name "2x3 :3'"
                   :description "Pauses between variable length exercises"
                   :entries [{
                              :type "repeat"
                              :repetitions 2
                              :description "Sets"
                              :group [{
                                       :type "repeat"
                                       :repetitions 3
                                       :description "Reps"
                                       :group [{
                                                :type "countdown"
                                                :category "pause"
                                                :duration 180
                                                :skip [1]
                                                :pauseWhenComplete true
                                                }]
                                       }
                                      {
                                       :type "countdown"
                                       :category "pause"
                                       :duration 300
                                       :skip [-1]
                                       :pauseWhenComplete true
                                       }]
                              }]
                   }]]
    {:status 200
     :headers {"Content-Type" "application/json; charset=utf-8"}
     :body (json/write-str sessions)}))

(defn home-routes []
  [""
   {:middleware [middleware/wrap-csrf
                 middleware/wrap-formats]}
   ["/" {:get home-page}]
   ["/sessions" {:get sessions}]
   ["/docs" {:get (fn [_]
                    (-> (response/ok (-> "docs/docs.md" io/resource slurp))
                        (response/header "Content-Type" "text/plain; charset=utf-8")))}]])

