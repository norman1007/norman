ASSETS INSPECT MANAGEMENTS SYSTEM (AIMS)

PROGRESS IMPLEMENTATION
-----------------------

USER MODULE

1) User registration [done]
2) User login [done]
3) User logout [done]
4) User register with profile image [done]
5) Update user [done]
6) Update user with profile image [done]
7) User can change their password [done]
8) Delete user [check] [dont need to delete anymore]
9) Cannot add user if work ID already existed [otw]
10) hash user password [done]
11) Make user active or unactive [done]

INDEX PAGE

1) Make card to link the module [done]

ADMIN MODULE 

1) GET ALL
    - USER [done]
    - ASSET [done]
    - SUPPLIER [done]
    - PLACEMENT [done]
    - MAINTAINANCE [done]
    - ACQUISATION

2) MAKE CHART THAT COUNT FOR ALL COLLECTIONS [done]
3) DELETE NAVIGATION ON ADMIN BUT PUT IT ON INDEX [done]
 - replace it with chart.

ASSETS MODULE

1) Create assets [done]
2) Update asset [done]
3) Delete assets [done]
4) Delete asset with associate data
5) Associate user with asset [done]
6) Validate the asset registration [done]
7) Make pagination button [done]
8) Format number [done]

SUPPLIERS MODULE

1) Create supplier [done] - bug part error checking, atleast display to user the error
2) Update supplier [done] - the endpoint is success but the form are not ready yet
3) Delete Supplier [done]
4) Link suppliers to asset form [done]
5) Associate the user who create supplier [otw]
6) Disable the submit button if no data [otw]

PLACEMENTS MODULE - THIS MODULE WILL BE REPLACE WITH DATABASE CONNECTION

1) Assign officer particular asset [done]
2) Update placement 
3) Delete placement [done]
4) Reference placement to linked asset - kena slice array dlu pastu baru cari field plc. 
 - Jumpa aset rujukan. tp kena test kemasukan aset lain juga. 
5) Disable the submit button if no data [done]

MAINTAINANCE MODULE

1) Create maintainance and associated with asset [done]
2) Delete maintainance [done]
3) Recalculate maintainance [done]
4) Make a chart for maintainance
5) Make delete button work [done]
6) Hidden the input field [done] 
7) Make submit button disable if total === '0.00' [done] - bug need to click to enable the button
8) Format number for maintainance [done]

DISCUSSION MODULE

- Save the discussion and reference to Kewpa3 models [error]

GOALS

29/1/2019
1) Installing morgan [done]
2) configure morgan for production logs [done]
3) make access controll [done]
4) disamble admin page [done]
5) find bug that cause kewpa3 cannot be save.. i thing must import kewpa3 model to app.js and require on io.js
6) reconstruct all asset page.. add search function along with pagination [done]
7) make user active or deactive 
    - make isActive type boolean on user model [done]
    - make name = isActive [done]
    - configure to make default value is true [done]
    - make when ever admin tick or click the input type checkbox it will change the value in the user model to be true for active or 
      false to deactive [done]
    - make a logic to make the user cannot login if that user is deactive(isActive === false) [done]
        - the logic is, if isActive is false then. configure at middleware to check the value of isActive. 
        - Then make [done]
        if (req.body.isActive === true) {
            authenticate the user
        } else if(req.body.isActive === false) {
            reject the login request
        } else {
            or if the checkbox is untick make user cannot login aswell.
            next();
        }

31/1/2019
1) make kewpa3 bahagian a printed [done]
    - print button at sidebar [done]
      (must configure path at getAUser route)
      (put logic to detect the route only on user)
    - has to sent kewpa3 id to the sidebar
    - specify a column beside catatan for YDP signature [done]
    - make it print [done]
2) add 2 column to bahagian b selenggara
3) costomize the printed page for kewpa3 a + b and kewpa15 (also for maintainances) 
    - kewpa3 A [done]
    - kewpa3 B 
    - kewpa 15 [half]
4) make admin just like active selections [done]
5) But on printing Kewpa3
    - cannot print if placement not assign
6) install mustache js [done]
7) 102 render message with mustache [done]
8) make notifications
    - use lobibox.. = in the backend side still use connect flash and express session to get the error message and success message
    - then use lobibox to display the error and success message in the form of its ui, means use its feature (dialog box and notify).
9) pretty url [implement] [unnescessary]
    - install npm install --save mongoose-url-slugs [done]
    - require package in the models
    - make = slug: {
        type: String
    }
    - PostSchema.plugin(URLSlugs('title', {field: 'slug'}));
    - delete all the post
    - need to place the slug field in the models after the title field
    - show the slug instead of id
    - the href for post id need to replace with slug <%= post.slug %>
    - to use req,params.slug need to change in the routes router.get('/post/:id') to router.get('/post/:slug')
    - Post.findOne({slug: req.params.slug})

10) image binary
    - change image from string to buffer, image: String = image: buffer [done]
    - avatar than being replace to image, image: String = avatar: String [done]
    - note that image can only be uploaded for 5mb, and only selected format are allowed [done]
    - make first name, last name then concatinate. put into select tag and then make it choosable in the kewpa bahagian b under the name of (g)    nama dan jabatan

11) Nescessary fix
    - implement emoji picker for discussions
    - put user model with default emp_name 'NAMA ANDA' into Server [done]
    - fix senarai cetakan for maintainances (letak link untuk generate pdf selenggara)
        1) masukkan nama pegawai dan jawatan semasa cetak
    - implement role for inserting assets && maintainances (pegawai aset && pegawai kenderaan) [done]
        1) follow up prosedur lantikan pegawai aset dan pegawai kenderaan
        2) setup template lantikan
        3) user akan request utk jd pegawai aset / kenderaan, s.u / ydp akan approve / tidak [X]

12) 
    

DEFAULT FEATURE
---------------

1) 

DATE FORMAT
1) console.log("1) "+  new Date().toDateString());
2) console.log("2) "+  new Date().toISOString());
3) console.log("3) "+  new Date().toJSON());
4) console.log("4) "+  new Date().toLocaleDateString());
5) console.log("5) "+  new Date().toLocaleString());
6) console.log("6) "+  new Date().toLocaleTimeString());
7) console.log("7) "+  new Date().toString());
8) console.log("8) "+  new Date().toISOString().slice(0,10));

Result 

1) Wed Oct 31 2018
2) 2018-10-31T04:50:23.347Z
3) 2018-10-31T04:50:23.347Z
4) 10/31/2018
5) 10/31/2018, 12:50:23 PM
6) 12:50:23 PM
7) Wed Oct 31 2018 12:50:23 GMT+0800 (Singapore Standard Time)
8) 2018-10-31