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
                   :name "4x4 :3'"
                   :description ""
                   :session [{
                              :type "repeat"
                              :repetitions 4
                              :group [{
                                       :type "countdown"
                                       :category "work"
                                       :duration 240
                                       }
                                      {
                                       :type "countdown"
                                       :category "pause"
                                       :duration 180
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

