// Copyright 2013 Örjan Persson
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package main

import (
	"flag"
	"io/ioutil"
	"log"
	"os"
	"os/signal"
	"path"
	"math/rand"
	"time"

	"./server"

	"github.com/op/go-libspotify/spotify"
	"fmt"
)

var (
	appKeyPath = flag.String("key", "spotify.key", "path to app.key")
	username   = flag.String("username", "", "spotify username")
	password   = flag.String("password", "", "spotify password")
)

func main() {
	flag.Parse()
	prog := path.Base(os.Args[0])

	signals := make(chan os.Signal, 1)
	signal.Notify(signals, os.Interrupt, os.Kill)

	appKey, err := ioutil.ReadFile(*appKeyPath)
	if err != nil {
		log.Fatal(err)
	}

	audio, err := server.NewAudioWriter()
	if err != nil {
		log.Fatal(err)
	}
	defer audio.Close()

	session, err := server.NewMusicPlayer(&spotify.Config{
		ApplicationKey:   appKey,
		ApplicationName:  prog,
		CacheLocation:    "tmp",
		SettingsLocation: "tmp",
		AudioConsumer:    audio,

		// Disable play lists to make playback faster
		DisablePlaylistMetadataCache: true,
		InitiallyUnloadPlaylists:     true,
	}, *username, *password)
	if err != nil {
		log.Fatal(err)
	}
	defer session.Close()

	// Log messages
	go func() {
		for msg := range session.LogMessages() {
			log.Print(msg)
		}
	}()

	// Wait for login and expect it to go fine
	select {
	case err = <-session.LoggedInUpdates():
		if err != nil {
			log.Fatal(err)
		}
	case <-signals:
		return
	}

	queue, err := server.NewQueue()
	if err != nil {
		log.Fatal(err)
	}

	api, err := server.NewApi(":8080", queue, session)
	if err != nil {
		log.Fatal(err)
	}

	api.SetNextTrack()

	for {
		select {
		case currentTrack := <-session.StartOfTrackUpdates:
			queue.ResetVotes(currentTrack.Uri)
			api.SetNextTrack()
		case <-session.EndOfTrackUpdates():
			if session.CurrentTrack != nil {
				log.Println("[music.go] Track Finished: ", session.CurrentTrack.String())
				session.CurrentTrack = nil
				session.Player.Unload()
			}

			if (random(0, 5) == 0) {
				files, _ := ioutil.ReadDir("./stingers")
				rando := random(0, len(files))

				audio.WriteFile("./stingers/" + files[rando].Name())
				fmt.Println(files[rando].Name())
			}

			session.Play()
		case <-signals:
			return
		}
	}
}

func random(min, max int) int {
	rand.Seed(time.Now().Unix())
	return rand.Intn(max - min) + min
}
