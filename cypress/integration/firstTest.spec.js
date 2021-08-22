/// <reference types="cypress" />


describe('Test with backend', () =>{
    beforeEach('login to the app', () =>{
        cy.intercept('GET', '**/tags', {fixture:'tags.json'})
        cy.loginToApplication()
    })

    it('should log in', () =>{
        cy.log('Yeeey we successfully logged in!!!')
    })

    it.skip('verify correct request an dresponse', () =>{
        cy.intercept('POST', '**/articles').as('postArticles')
        // cy.intercept('POST', '**/articles').as('postArticles')

        cy.contains('New Article').click()
        cy.get('[formcontrolname="title"]').type('My new article1')
        cy.get('[formcontrolname="description"]').type('This is my atricle description')
        cy.get('[formcontrolname="body"]').type('This is a body of the Article')
        cy.contains('Publish Article').click()

        // always use cy.wait for the completion of the call
        cy.wait('@postArticles')
        // object comimh back as a json object - xhr!
        cy.get('@postArticles').then( xhr =>{
            cy.log(xhr)
            console.log(xhr)
            expect(xhr.response.statusCode).to.equal(200)
            expect(xhr.request.body.article.body).to.equal('This is a body of the Article')
            expect(xhr.response.body.article.description).to.equal('This is my atricle description')
        })
    })

    it('should gave tags with routing object', () =>{
        cy.get('.tag-list')
        .should('contain', 'cypress')
        .and('contain', 'automation')
        .and('contain', 'testing')
    })


    it('verify global feed likes count', () =>{
        cy.intercept('GET', '**/articles/feed*', '{"articles":[],"articlesCount":0}')
        cy.intercept('GET', '**/articles*', {fixture:'articles.json'})

        cy.contains('Global Feed').click()
        cy.get('app-article-list button').then( listOfbuttons =>{
            expect(listOfbuttons[0]).contain('8')
            expect(listOfbuttons[1]).contain('19')
        })

        cy.fixture('articles').then(file => {
            const articleLink = file.articles[1].slug
            cy.intercept('POST', '**/articles/'+articleLink+'/favorite', file)
        })

        cy.get('app-article-list button')
        .eq(1)
        .click()
        .should('contain', '20')
    })
})